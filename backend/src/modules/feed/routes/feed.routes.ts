import { Router } from "express";
import { FeedController } from "../controllers/feedController.js";
import { FeedService } from "../services/feedService.js";
import { FeedPostRepository } from "../repositories/feedPostRepository.js";
import { PhotographerRepository } from "../../photographer/repositories/PhotographerRepository.js";
import { r2StorageService } from "../../../shared/services/R2StorageService.js";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";

const router = Router();

const feedPostRepository = new FeedPostRepository();
const photographerRepository = new PhotographerRepository();
const feedService = new FeedService(feedPostRepository, r2StorageService);
const feedController = new FeedController(feedService, photographerRepository);


router.post(
  "/",
  authenticate,
  feedController.createPost.bind(feedController),
);
router.post(
  "/posts",
  authenticate,
  feedController.createPost.bind(feedController),
);

export default router;
