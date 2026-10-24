import { Router } from "express";
import { FeedController } from "../controllers/feedController.js";
import { FeedService } from "../services/feedService.js";
import { FeedPostRepository } from "../repositories/feedPostRepository.js";
import { PhotographerRepository } from "../../photographer/repositories/PhotographerRepository.js";
import { r2StorageService } from "../../../shared/services/R2StorageService.js";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { UserRepository } from "../../auth/repositories/UserRepository.js";

const router = Router();

const feedPostRepository = new FeedPostRepository();
const photographerRepository = new PhotographerRepository();
const userRepository = new UserRepository();
const feedService = new FeedService(
  feedPostRepository,
  r2StorageService,
  userRepository,
);
const feedController = new FeedController(feedService, photographerRepository);

router.get("/my-posts", authenticate, feedController.getMyPosts.bind(feedController));
router.get("/", authenticate, feedController.getFeed.bind(feedController));
router.get("/posts", authenticate, feedController.getFeed.bind(feedController));

router.delete("/:id", authenticate, feedController.deletePost.bind(feedController));

router.post("/", authenticate, feedController.createPost.bind(feedController));
router.post(
  "/posts",
  authenticate,
  feedController.createPost.bind(feedController),
);

export default router;
