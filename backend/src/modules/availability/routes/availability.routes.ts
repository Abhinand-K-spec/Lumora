import Router from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { validate } from "../../../shared/middlewares/validation.middleware.js";
import { blockAvailabilitySchema } from "../../../shared/validators/availability.validator.js";
import { AvailabilityController } from "../controllers/AvailabilityController.js";
import { AvailabilityService } from "../services/AvailabilityService.js";
import { AvailabilityRepository } from "../repositories/AvailabilityRepository.js";
import { BookingRepository } from "../../booking/repositories/BookingRepository.js";

const router = Router();

const availabilityRepository = new AvailabilityRepository();
const bookingRepository = new BookingRepository();
const availabilityService = new AvailabilityService(
  bookingRepository,
  availabilityRepository
);
const availabilityController = new AvailabilityController(availabilityService);

// 1. Photographer's own monthly calendar
router.get(
  "/my-calendar",
  authenticate,
  availabilityController.getMyCalendar.bind(availabilityController)
);

// 2. Client / public view of any photographer's availability
router.get(
  "/calendar/:photographerId",
  availabilityController.getPhotographerCalendar.bind(availabilityController)
);

// 3. Block off dates (photographer only)
router.post(
  "/block",
  authenticate,
  validate(blockAvailabilitySchema),
  availabilityController.blockDates.bind(availabilityController)
);

// 4. Unblock dates (photographer only)
router.delete(
  "/unblock/:availabilityId",
  authenticate,
  availabilityController.unblockDates.bind(availabilityController)
);

// Also support standard DELETE /:availabilityId for REST consistency
router.delete(
  "/:availabilityId",
  authenticate,
  availabilityController.unblockDates.bind(availabilityController)
);

export default router;

