import { Router } from "express";
import { AdminPhotographerService } from "../services/AdminPhotographerService.js";
import { AdminPhotographerController } from "../controllers/AdminPhotographerController.js";
import { PhotographerApprovalRequestRepository } from "../../../photographer/repositories/PhotographerApprovalRequestRepository.js";
import { PhotographerRepository } from "../../../photographer/repositories/PhotographerRepository.js";
import { authenticate } from "../../../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../../../shared/middlewares/authorize.middleware.js";
import { userRole } from "../../../../shared/enums/UserRole.js";
import { validate } from "../../../../shared/middlewares/validation.middleware.js";
import { reviewApprovalRequestSchema } from "../../../../shared/validators/photographer.validator.js";

const router = Router();

const approvalRepo = new PhotographerApprovalRequestRepository();
const photographerRepo = new PhotographerRepository();

const adminPhotographerService = new AdminPhotographerService(
  approvalRepo,
  photographerRepo,
);
const adminPhotographerController = new AdminPhotographerController(
  adminPhotographerService,
);

// Secure all admin photographer management routes with authentication and ADMIN role check
router.use(authenticate);
router.use(authorize(userRole.ADMIN));

// GET /api/admin/photographers/requests?status=PENDING&page=1&limit=10
router.get(
  "/requests",
  adminPhotographerController.getApprovalRequests.bind(
    adminPhotographerController,
  ),
);

// GET /api/admin/photographers/metrics
router.get(
  "/metrics",
  adminPhotographerController.getMetrics.bind(adminPhotographerController),
);

// PATCH /api/admin/photographers/requests/:requestId/review
router.patch(
  "/requests/:requestId/review",
  validate(reviewApprovalRequestSchema),
  adminPhotographerController.reviewRequest.bind(adminPhotographerController),
);

export default router;
