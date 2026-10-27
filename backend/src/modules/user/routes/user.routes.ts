import { Router } from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import { UserRepository } from "../../auth/repositories/UserRepository.js";
import { UserProfileRepository } from "../repositories/UserProfileRepository.js";
import { SavedPhotographerRepository } from "../repositories/SavedPhotographerRepository.js";
import { PhotographerRepository } from "../../photographer/repositories/PhotographerRepository.js";
import { PackageRepository } from "../../photographer/repositories/PackageRepository.js";
import { uploadProfilePhoto } from "../../../shared/middlewares/upload.middleware.js";
import { uploadToCloudinaryMiddleware } from "../../../shared/middlewares/cloudinaryUpload.middleware.js";

const router = Router();

const userRepository = new UserRepository();
const userProfileRepository = new UserProfileRepository();
const savedPhotographerRepository = new SavedPhotographerRepository();
const photographerRepository = new PhotographerRepository();
const packageRepository = new PackageRepository();

const userService = new UserService(
  userRepository,
  userProfileRepository,
  savedPhotographerRepository,
  photographerRepository,
  packageRepository,
);

const userController = new UserController(userService);

router.get(
  "/profile",
  authenticate,
  userController.getProfile.bind(userController),
);
router.patch(
  "/profile",
  authenticate,
  userController.editProfile.bind(userController),
);

router.post(
  "/profile/upload",
  authenticate,
  uploadProfilePhoto.single("photo"),
  uploadToCloudinaryMiddleware("profile_photos"),
  userController.uploadProfilePhoto.bind(userController),
);

// Saved Photographers routes
router.get(
  "/saved-photographers",
  authenticate,
  userController.getSavedPhotographers.bind(userController),
);
router.get(
  "/saved-photographers/ids",
  authenticate,
  userController.getSavedPhotographerIds.bind(userController),
);
router.get(
  "/saved-photographers/:photographerId/status",
  authenticate,
  userController.checkIsPhotographerSaved.bind(userController),
);
router.post(
  "/saved-photographers/:photographerId",
  authenticate,
  userController.toggleSavePhotographer.bind(userController),
);

export default router;
