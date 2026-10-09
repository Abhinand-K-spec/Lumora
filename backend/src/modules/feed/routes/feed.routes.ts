import { Router } from "express";
import { FeedController } from "../controllers/feedController.js";
import { FeedService } from "../services/feedService.js";
import { FeedPostRepository } from "../repositories/feedPostRepository.js";
import { r2StorageService } from "../../../shared/services/R2StorageService.js";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";

const router = Router();

// Dependency injection — wired here, matching the project pattern
const feedPostRepository = new FeedPostRepository();
const feedService = new FeedService(feedPostRepository, r2StorageService);
const feedController = new FeedController(feedService);

// POST /api/feed/posts
router.post(
  "/posts",
  authenticate,
  feedController.createPost.bind(feedController),
);

export default router;
