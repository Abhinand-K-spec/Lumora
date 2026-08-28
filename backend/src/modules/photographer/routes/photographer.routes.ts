import { Router } from "express";
import { PhotographerService } from "../services/PhotographerService";
import { PhotographerController } from "../controllers/PhotographerController";
import { UserRepository } from "../../auth/repositories/UserRepository";
import { PhotographerRepository } from "../repositories/PhotographerRepository";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { uploadProfilePhoto } from "../../../shared/middlewares/upload.middleware";
import { uploadToCloudinaryMiddleware } from "../../../shared/middlewares/cloudinaryUpload.middleware";

const router = Router();


const userRepository = new UserRepository();
const photographerRepository = new PhotographerRepository();

const photographerService = new PhotographerService(userRepository,photographerRepository);
const photographerController = new PhotographerController(photographerService);



router.get('/profile',authenticate,photographerController.getProfile.bind(photographerController));
router.patch('/profile',authenticate,photographerController.editProfile.bind(photographerController));
router.post('/profile/upload',authenticate,uploadProfilePhoto.single('photo'),uploadToCloudinaryMiddleware('photographer_profiles'),photographerController.uploadProfilePhoto.bind(photographerController));
router.post('/profile/upload-cover',authenticate,uploadProfilePhoto.single('photo'),uploadToCloudinaryMiddleware('photographer_covers'),photographerController.uploadCoverPhoto.bind(photographerController));

export default router;