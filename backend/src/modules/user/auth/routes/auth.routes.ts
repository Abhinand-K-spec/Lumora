import { Router } from 'express';
import { UserAuthController } from '../controllers/UserAuthController.js';
import { PhotographerAuthController } from '../../../photographer/auth/controllers/PhotographerAuthController.js';
import { UserAuthService } from '../services/UserAuthService.js';
import { PhotographerAuthService } from '../../../photographer/auth/services/PhotographerAuthService.js';
import { PasswordService } from '../services/PasswordService.js';
import { TokenService } from '../services/TokenService.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { PhotographerRepository } from '../../../photographer/repositories/PhotographerRepository.js';
import { OTPService } from '../services/OTPService.js';
import { EmailService } from '../services/EmailService.js';
import { authenticate } from '../../../../shared/middlewares/auth.middleware.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { userRole } from '../../../../shared/enums/UserRole.js';

const router = Router();

const userRepository = new UserRepository();
const photographerRepository = new PhotographerRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const otpService = new OTPService();
const emailService = new EmailService();

const userAuthService = new UserAuthService(
    userRepository, passwordService, tokenService, emailService, otpService
);

const photographerAuthService = new PhotographerAuthService(
    photographerRepository, passwordService, tokenService, emailService, otpService
);

const userAuthController = new UserAuthController(userAuthService);
const photographerAuthController = new PhotographerAuthController(photographerAuthService);

// Helper to determine route target
const getControllerByEmail = async (email: string) => {
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
        return userAuthController;
    }
    const photographerExists = await photographerRepository.findByEmail(email);
    if (photographerExists) {
        return photographerAuthController;
    }
    return null;
};

router.post('/register', async (req, res, next) => {
    try {
        const { email, role } = req.body;
        
        // Enforce email uniqueness check globally across both user and photographer collections
        const userExists = await userRepository.findByEmail(email);
        const photographerExists = await photographerRepository.findByEmail(email);

        if (userExists || photographerExists) {
            throw new AppError(409, 'User already exists');
        }

        if (role === userRole.PHOTOGRAPHER) {
            await photographerAuthController.register(req, res, next);
        } else {
            await userAuthController.register(req, res, next);
        }
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const controller = await getControllerByEmail(req.body.email);
        if (!controller) {
            throw new AppError(409, 'Invalid email or password');
        }
        await controller.login(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new AppError(401, 'Refresh token is missing');
        }

        const payload = tokenService.verifyRefreshToken(refreshToken);
        if (payload.role === userRole.PHOTOGRAPHER) {
            await photographerAuthController.refresh(req, res, next);
        } else {
            await userAuthController.refresh(req, res, next);
        }
    } catch (error) {
        next(error);
    }
});

router.post("/verifyEmail", async (req, res, next) => {
    try {
        const controller = await getControllerByEmail(req.body.email);
        if (!controller) {
            throw new AppError(401, "User not found");
        }
        await controller.verifyEmail(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post("/resendOtp", async (req, res, next) => {
    try {
        const controller = await getControllerByEmail(req.body.email);
        if (!controller) {
            throw new AppError(404, "User not found");
        }
        await controller.resendOtp(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/forgotPassword', async (req, res, next) => {
    try {
        const controller = await getControllerByEmail(req.body.email);
        if (!controller) {
            throw new AppError(404, "User not found");
        }
        await controller.forgotPassword(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/verifyResendOtp', async (req, res, next) => {
    try {
        const controller = await getControllerByEmail(req.body.email);
        if (!controller) {
            throw new AppError(404, "User not found");
        }
        await controller.verifyResetOtp(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/resetPassword', async (req, res, next) => {
    try {
        const controller = await getControllerByEmail(req.body.email);
        if (!controller) {
            throw new AppError(404, "User not found");
        }
        await controller.resetPassword(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/logout', authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError(401, "Unauthorized");
        }
        if (req.user.role === userRole.PHOTOGRAPHER) {
            await photographerAuthController.logout(req, res, next);
        } else {
            await userAuthController.logout(req, res, next);
        }
    } catch (error) {
        next(error);
    }
});

export default router;
