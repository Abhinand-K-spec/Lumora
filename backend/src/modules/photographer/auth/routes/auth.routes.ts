import { Router } from 'express';
import { PhotographerAuthController } from '../controllers/PhotographerAuthController.js';
import { PhotographerAuthService } from '../services/PhotographerAuthService.js';
import { PasswordService } from '../../../user/auth/services/PasswordService.js';
import { TokenService } from '../../../user/auth/services/TokenService.js';
import { PhotographerRepository } from '../../repositories/PhotographerRepository.js';
import { OTPService } from '../../../user/auth/services/OTPService.js';
import { EmailService } from '../../../user/auth/services/EmailService.js';
import { authenticate } from '../../../../shared/middlewares/auth.middleware.js';

const router = Router();

const photographerRepository = new PhotographerRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const otpService = new OTPService();
const emailService = new EmailService();

const photographerAuthService = new PhotographerAuthService(
    photographerRepository, passwordService, tokenService, emailService, otpService
);

const photographerAuthController = new PhotographerAuthController(photographerAuthService);

router.post('/register', photographerAuthController.register.bind(photographerAuthController));
router.post('/login', photographerAuthController.login.bind(photographerAuthController));
router.post('/refresh', photographerAuthController.refresh.bind(photographerAuthController));
router.post("/verifyEmail", photographerAuthController.verifyEmail.bind(photographerAuthController));
router.post("/resendOtp", photographerAuthController.resendOtp.bind(photographerAuthController));
router.post('/forgotPassword', photographerAuthController.forgotPassword.bind(photographerAuthController));
router.post('/verifyResendOtp', photographerAuthController.verifyResetOtp.bind(photographerAuthController));
router.post('/resetPassword', photographerAuthController.resetPassword.bind(photographerAuthController));
router.post('/logout', authenticate, photographerAuthController.logout.bind(photographerAuthController));

export default router;
