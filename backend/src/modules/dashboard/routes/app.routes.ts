import { Router } from "express";

import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { AppController } from "../controller/appController.js";
import { AppService } from "../services/AppService.js";
import { UserRepository } from "../../users/repositories/UserRepository.js";

const router = Router();

const userRepository = new UserRepository();

const appService = new AppService(userRepository);

const appController = new AppController(appService);

router.get( "/me",authenticate,appController.getCurrentUser.bind(appController));

export default router;