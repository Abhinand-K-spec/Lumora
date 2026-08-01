import { Router } from 'express';
import { UserAuthController } from '../controllers/UserAuthController.js';
import { UserAuthService } from '../services/UserAuthService.js';
import { PasswordService } from '../services/PasswordService.js';
import { TokenService } from '../services/TokenService.js';
import { UserRepository } from '../../general/controllers/repositories/UserRepository.js';
import { OTPService } from '../services/OTPService.js';
import { EmailService } from '../services/EmailService.js';
import { GoogleAuthService } from '../services/GoogleOauthService.js';
import { PhotographerRepository } from '../../../photographer/repositories/PhotographerRepository.js';
import { authenticate } from '../../../../shared/middlewares/auth.middleware.js';

const router = Router();

const userRepository = new UserRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const otpService = new OTPService();
const emailService = new EmailService();

const userAuthService = new UserAuthService(
    userRepository, passwordService, tokenService, emailService, otpService
);

const googleAuthService = new GoogleAuthService();
const photographerRepository = new PhotographerRepository();

const userAuthController = new UserAuthController(
    userAuthService,
    googleAuthService,
    userRepository,
    photographerRepository,
    tokenService
);

router.post('/register', userAuthController.register.bind(userAuthController));
router.post('/login', userAuthController.login.bind(userAuthController));
router.post('/refresh', userAuthController.refresh.bind(userAuthController));
router.post("/verifyEmail", userAuthController.verifyEmail.bind(userAuthController));
router.post("/resendOtp", userAuthController.resendOtp.bind(userAuthController));
router.post('/forgotPassword', userAuthController.forgotPassword.bind(userAuthController));
router.post('/verifyResendOtp', userAuthController.verifyResetOtp.bind(userAuthController));
router.post('/resetPassword', userAuthController.resetPassword.bind(userAuthController));
router.post('/logout', authenticate, userAuthController.logout.bind(userAuthController));
router.get("/google",userAuthController.googleLogin.bind(userAuthController));
router.get("/google/callback",userAuthController.googleCallback.bind(userAuthController));

export default router;
