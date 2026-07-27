import { Router } from 'express';
import { AdminAuthController } from '../controllers/AdminAuthController.js';
import { AdminAuthService } from '../services/AdminAuthService.js';
import { AdminRepository } from '../../../admin/repositories/AdminRepository.js';
import { PasswordService } from '../../user/services/PasswordService.js';
import { TokenService } from '../../user/services/TokenService.js';
import { authenticate } from '../../../../shared/middlewares/auth.middleware.js';

const router = Router();

const adminRepository = new AdminRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();

const adminAuthService = new AdminAuthService(
    adminRepository,
    passwordService,
    tokenService
);

const adminAuthController = new AdminAuthController(adminAuthService);

router.post('/login', adminAuthController.login.bind(adminAuthController));
router.post('/refresh', adminAuthController.refresh.bind(adminAuthController));
router.post('/logout', authenticate, adminAuthController.logout.bind(adminAuthController));
router.get('/me', authenticate, adminAuthController.getCurrentAdmin.bind(adminAuthController));

export default router;
