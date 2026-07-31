import { Router } from "express";
import { UserManagementService } from "../services/UserManagementService";
import { UserManagementController } from "../controllers/UserManagementController";
import { AdminRepository } from "../../repositories/AdminRepository";
import { UserRepository } from "../../../user/repositories/UserRepository";

const router = Router();


const adminRepository = new AdminRepository(); 
const userRepository = new UserRepository();
const userManagementService = new UserManagementService(
    userRepository
);


const userManagementController = new UserManagementController(userManagementService);


router.get('/users',userManagementController.getUsers.bind(userManagementController));



export default router;