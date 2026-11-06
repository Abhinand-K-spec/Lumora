import Router from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { QuotationController } from '../controllers/QuotationController';
import { QuotationService } from '../services/QuotationService';
import { QuotationRepository } from '../repositories/QuotationRepository';
import { BookingRepository } from '../../booking/repositories/BookingRepository';
import { validate } from '../../../shared/middlewares/validation.middleware';
import { createQuotationSchema } from '../../../shared/validators/quotation.validator';

const router = Router();


const quotationRepository = new QuotationRepository()
const bookingRepository = new BookingRepository();
const quotationService = new QuotationService(bookingRepository,quotationRepository);
const quotationController = new QuotationController(quotationService);


router.post('/create/:bookingId',authenticate,validate(createQuotationSchema),quotationController.createDraft.bind(quotationController));
router.patch('/:id',authenticate,validate(createQuotationSchema),quotationController.updateQuotation.bind(quotationController));
router.patch('/:id/send',authenticate,quotationController.sendQuotation.bind(quotationController));

export default router