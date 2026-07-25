import {Router} from 'express';


import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../services/AuthService.js';
import { PasswordService } from '../services/PasswordService.js';
import { TokenService } from '../services/TokenService.js';
import { UserRepository } from '../../../repositories/UserRepository.js';
import { OTPService } from '../services/OTPService.js';
import { EmailService } from '../services/EmailService.js';

const router = Router();

const userRepository = new UserRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const otpService = new OTPService();
const emailService = new EmailService();

const authService = new AuthService(
    userRepository, passwordService, tokenService, emailService, otpService
)

const authController = new AuthController(authService);



router.post('/register',authController.register.bind(authController));
router.post('/login',authController.login.bind(authController));
router.post('/refresh',authController.refresh.bind(authController));
router.post( "/verify-email",authController.verifyEmail.bind(authController));
router.post("/resend-otp",authController.resendOtp.bind(authController));
router.post('/forgot-password',authController.forgotPassword.bind(authController));
router.post('/reset-password',authController.resetPassword.bind(authController));
router.post('/logout',authController.logout.bind(authController));

export default router;