import { Router } from "express";



import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { EventRepository } from "../repositories/EventRepository.js";
import { BookingRepository } from "../../booking/repositories/BookingRepository.js";
import { PaymentRepository } from "../../payment/repositories/PaymentRepository.js";
import { EventService } from "../services/EventService.js";
import { EventController } from "../controllers/eventController.js";

const router = Router();

// Dependency injection
const eventRepository = new EventRepository();
const bookingRepository = new BookingRepository();
const paymentRepository = new PaymentRepository();

const eventService = new EventService(
  eventRepository,
  bookingRepository,
  paymentRepository
);

const eventController = new EventController(eventService);

// Public route — guests can access event details without logging in
router.get(
  "/public/:publicId",
  eventController.getPublicEvent.bind(eventController)
);

// Protected routes — photographer must be authenticated
router.post(
  "/",
  authenticate,
  eventController.createEvent.bind(eventController)
);

router.get(
  "/photographer",
  authenticate,
  eventController.getPhotographerEvents.bind(eventController)
);

router.get(
  "/:eventId",
  authenticate,
  eventController.getEventById.bind(eventController)
);

router.patch(
  "/:eventId",
  authenticate,
  eventController.updateEvent.bind(eventController)
);

export default router;