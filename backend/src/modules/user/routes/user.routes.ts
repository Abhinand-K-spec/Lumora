import { Router } from "express";

import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import { UserRepository } from "../../auth/repositories/UserRepository.js";
import { UserProfileRepository } from "../repositories/UserProfileRepository.js";
import { uploadProfilePhoto } from "../../../shared/middlewares/upload.middleware.js";

const router = Router();

const userRepository = new UserRepository();
const userProfileRepository = new UserProfileRepository();

const userService = new UserService(userRepository, userProfileRepository);

const userController = new UserController(userService);



router.get('/profile',authenticate,userController.getProfile.bind(userController));
router.patch('/profile',authenticate,userController.editProfile.bind(userController));

router.post('/profile/upload',authenticate,uploadProfilePhoto.single('photo'),userController.uploadProfilePhoto.bind(userController));

export default router;
