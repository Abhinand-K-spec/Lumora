import { Router } from "express";
import { UserManagementService } from "../services/UserManagementService";
import { UserManagementController } from "../controllers/UserManagementController";
import { UserRepository } from "../../../user/repositories/UserRepository";

const router = Router();

const userRepository = new UserRepository();
const userManagementService = new UserManagementService(
    userRepository
);


const userManagementController = new UserManagementController(userManagementService);


router.get('/users',userManagementController.getUsers.bind(userManagementController));
router.patch('/users/:id/status',userManagementController.changeStatus.bind(userManagementController));
router.delete('/users/:id/delete',userManagementController.delete.bind(userManagementController));


export default router;