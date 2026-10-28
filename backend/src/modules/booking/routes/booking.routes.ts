import Router from 'express';
import { BookingRepository } from '../repositories/BookingRepository';
import { BookingService } from '../services/BookingService';
import { BookingController } from '../controllers/BookingController';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { createBookingSchema } from '../../../shared/validators/booking.validator';
import { validate } from '../../../shared/middlewares/validation.middleware';
import { NotificationService } from '../../notification/services/NotificationService';
import { NotificationRepository } from '../../notification/repositories/NotificationRepository';
const router =  Router();


const bookingRepository = new BookingRepository();
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const bookingService = new BookingService(bookingRepository,notificationService);
const bookingController = new BookingController(bookingService);

router.post(
    "/",
    authenticate,
    validate(createBookingSchema),
    bookingController.createBooking.bind(bookingController)
  );
  
  router.get(
    "/my-bookings",
    authenticate,
    bookingController.getUserBookings.bind(bookingController)
  );
  
  router.get(
    "/photographer-requests",
    authenticate,
    bookingController.getPhotographerBookings.bind(bookingController)
  );
  
  router.patch(
    "/:id/status",
    authenticate,
    bookingController.updateStatus.bind(bookingController)
  );
  
  export default router;