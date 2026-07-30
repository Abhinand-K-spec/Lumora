import { Router } from "express";
import { UserManagementService } from "../services/UserManagementService";
import { UserManagementController } from "../controllers/userManagementController";
import { AdminRepository } from "../../repositories/AdminRepository";

const router = Router();


const adminRepository = new AdminRepository(); 
const userManagementService = new UserManagementService(
    adminRepository
);


const userManagementController = new UserManagementController(userManagementService);


router.get('/users',userManagementController.getUsers.bind(userManagementController));



export default router;