import { Router } from "express";

import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import { UserRepository } from "../../auth/repositories/UserRepository.js";

const router = Router();

const userRepository = new UserRepository();

const userService = new UserService(userRepository);

const userController = new UserController(userService);

router.get( "/me",authenticate,userController.getCurrentUser.bind(userController));

export default router;
