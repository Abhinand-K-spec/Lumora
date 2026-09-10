import { Router } from "express";
import { PhotographerService } from "../services/PhotographerService.js";
import { PhotographerController } from "../controllers/PhotographerController.js";
import { UserRepository } from "../../auth/repositories/UserRepository.js";
import { PhotographerRepository } from "../repositories/PhotographerRepository.js";
import { PackageRepository } from "../repositories/PackageRepository.js";
import { PhotographerApprovalRequestRepository } from "../repositories/PhotographerApprovalRequestRepository.js";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { validate } from "../../../shared/middlewares/validation.middleware.js";
import { editPhotographerProfileSchema } from "../../../shared/validators/photographer.validator.js";
import { uploadProfilePhoto } from "../../../shared/middlewares/upload.middleware.js";
import { uploadToCloudinaryMiddleware } from "../../../shared/middlewares/cloudinaryUpload.middleware.js";

const router = Router();

const userRepository = new UserRepository();
const photographerRepository = new PhotographerRepository();
const packageRepository = new PackageRepository();
const approvalRequestRepository = new PhotographerApprovalRequestRepository();

const photographerService = new PhotographerService(
  userRepository,
  photographerRepository,
  packageRepository,
  approvalRequestRepository,
);
const photographerController = new PhotographerController(photographerService);

router.get(
  "/",
  photographerController.getPhotographers.bind(photographerController),
);
router.get(
  "/profile",
  authenticate,
  photographerController.getProfile.bind(photographerController),
);
router.patch(
  "/profile",
  authenticate,
  validate(editPhotographerProfileSchema),
  photographerController.editProfile.bind(photographerController),
);

// Verification approval routes
router.post(
  "/approval-request",
  authenticate,
  photographerController.requestApproval.bind(photographerController),
);
router.get(
  "/approval-requests",
  authenticate,
  photographerController.getApprovalHistory.bind(photographerController),
);

// Photo uploads
router.post(
  "/profile/upload",
  authenticate,
  uploadProfilePhoto.single("photo"),
  uploadToCloudinaryMiddleware("photographer_profiles"),
  photographerController.uploadProfilePhoto.bind(photographerController),
);
router.post(
  "/profile/upload-cover",
  authenticate,
  uploadProfilePhoto.single("photo"),
  uploadToCloudinaryMiddleware("photographer_covers"),
  photographerController.uploadCoverPhoto.bind(photographerController),
);

// Package management
router.post(
  "/profile/packages",
  authenticate,
  photographerController.addPackage.bind(photographerController),
);
router.put(
  "/profile/packages/:packageId",
  authenticate,
  photographerController.editPackage.bind(photographerController),
);
router.delete(
  "/profile/packages/:packageId",
  authenticate,
  photographerController.deletePackage.bind(photographerController),
);

// Public profile by userId (must come last to avoid shadowing named routes)
router.get(
  "/:userId",
  authenticate,
  photographerController.getPhotographerById.bind(photographerController),
);

export default router;
