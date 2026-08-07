import { Router } from "express";
import { UserManagementService } from "../services/UserManagementService.js";
import { UserManagementController } from "../controllers/UserManagementController.js";
import { UserRepository } from "../../../auth/repositories/UserRepository.js";
import { authenticate } from "../../../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../../../shared/middlewares/authorize.middleware.js";
import { userRole } from "../../../../shared/enums/UserRole.js";

const router = Router();

const userRepository = new UserRepository();
const userManagementService = new UserManagementService(
    userRepository
);

const userManagementController = new UserManagementController(userManagementService);

// Secure all admin user management routes
router.use(authenticate);
router.use(authorize(userRole.ADMIN));

router.get('/users', userManagementController.getUsers.bind(userManagementController));
router.patch('/users/:id/status', userManagementController.changeStatus.bind(userManagementController));
router.delete('/users/:id/delete', userManagementController.delete.bind(userManagementController));

export default router;