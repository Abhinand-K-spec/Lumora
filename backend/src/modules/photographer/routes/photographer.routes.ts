import { Router } from "express";
import { PhotographerService } from "../services/PhotographerService.js";
import { PhotographerController } from "../controllers/PhotographerController.js";
import { UserRepository } from "../../auth/repositories/UserRepository.js";
import { PhotographerRepository } from "../repositories/PhotographerRepository.js";
import { PackageRepository } from "../repositories/PackageRepository.js";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { uploadProfilePhoto } from "../../../shared/middlewares/upload.middleware.js";
import { uploadToCloudinaryMiddleware } from "../../../shared/middlewares/cloudinaryUpload.middleware.js";

const router = Router();


const userRepository = new UserRepository();
const photographerRepository = new PhotographerRepository();
const packageRepository = new PackageRepository();

const photographerService = new PhotographerService(userRepository, photographerRepository, packageRepository);
const photographerController = new PhotographerController(photographerService);



router.get('/',authenticate,photographerController.getPhotographers.bind(photographerController));
router.get('/profile',authenticate,photographerController.getProfile.bind(photographerController));
router.patch('/profile',authenticate,photographerController.editProfile.bind(photographerController));
router.post('/profile/upload',authenticate,uploadProfilePhoto.single('photo'),uploadToCloudinaryMiddleware('photographer_profiles'),photographerController.uploadProfilePhoto.bind(photographerController));
router.post('/profile/upload-cover',authenticate,uploadProfilePhoto.single('photo'),uploadToCloudinaryMiddleware('photographer_covers'),photographerController.uploadCoverPhoto.bind(photographerController));
router.post('/profile/packages',authenticate,photographerController.addPackage.bind(photographerController));
router.put('/profile/packages/:packageId',authenticate,photographerController.editPackage.bind(photographerController));
router.delete('/profile/packages/:packageId',authenticate,photographerController.deletePackage.bind(photographerController));

export default router;