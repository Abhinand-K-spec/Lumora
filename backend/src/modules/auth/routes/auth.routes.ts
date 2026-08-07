import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { AuthService } from '../services/authService.js';
import { PasswordService } from '../services/PasswordService.js';
import { TokenService } from '../services/TokenService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { OTPService } from '../services/OTPService.js';
import { EmailService } from '../../../shared/services/EmailService.js';
import { GoogleAuthService } from '../services/GoogleOauthService.js';
import { PhotographerRepository } from '../../photographer/repositories/PhotographerRepository.js';
import { UserProfileRepository } from '../../user/repositories/UserProfileRepository.js';
import { authenticate } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validation.middleware.js';
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../../../shared/validators/auth.validator.js';

const router = Router();

const userRepository = new UserRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const otpService = new OTPService();
const emailService = new EmailService();
const googleAuthService = new GoogleAuthService();
const photographerRepository = new PhotographerRepository();
const userProfileRepository = new UserProfileRepository();

const authService = new AuthService(
    userRepository,
    passwordService,
    tokenService,
    emailService,
    otpService,
    googleAuthService,
    photographerRepository,
    userProfileRepository
);

const authController = new AuthController(
    authService,
    tokenService
);

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));

router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail.bind(authController));
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp.bind(authController));

router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post('/verify-reset-otp', authController.verifyResetOtp.bind(authController));
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

router.get("/google", authController.googleLogin.bind(authController));
router.get("/google/callback", authController.googleCallback.bind(authController));

router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
