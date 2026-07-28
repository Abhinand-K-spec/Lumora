import { Router } from "express";

import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { PhotographerRepository } from "../../photographer/repositories/PhotographerRepository.js";

const router = Router();

const userRepository = new UserRepository();
const photographerRepository = new PhotographerRepository();

const userService = new UserService(userRepository, photographerRepository);

const userController = new UserController(userService);

router.get( "/me",authenticate,userController.getCurrentUser.bind(userController));

export default router;
