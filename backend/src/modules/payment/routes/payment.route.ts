import Router from "express";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { PaymentService } from "../services/PaymentService";
import { QuotationRepository } from "../../quotation/repositories/QuotationRepository";
import { BookingRepository } from "../../booking/repositories/BookingRepository";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { PaymentController } from "../controllers/PaymentController";

const router = Router();

const paymentRepository = new PaymentRepository();
const quotationRepository = new QuotationRepository();
const bookingRepository = new BookingRepository();
const paymentService = new PaymentService(
  paymentRepository,
  bookingRepository,
  quotationRepository
);
const paymentController = new PaymentController(paymentService);

router.post(
  "/advance/order",
  authenticate,
  paymentController.createAdvanceOrder.bind(paymentController)
);

router.post(
  "/advance/verify",
  authenticate,
  paymentController.verifyAdvancePayment.bind(paymentController)
);

router.get(
  "/user",
  authenticate,
  paymentController.getUserPayments.bind(paymentController)
);
router.get(
  "/photographer",
  authenticate,
  paymentController.getPhotographerPayments.bind(paymentController)
);

export default router;
