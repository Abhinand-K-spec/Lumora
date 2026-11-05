import Router from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { QuotationController } from '../controllers/QuotationController';
import { QuotationService } from '../services/QuotationService';
import { QuotationRepository } from '../repositories/QuotationRepository';
import { BookingRepository } from '../../booking/repositories/BookingRepository';

const router = Router();


const quotationRepository = new QuotationRepository()
const bookingRepository = new BookingRepository();
const quotationService = new QuotationService(bookingRepository,quotationRepository);
const quotationController = new QuotationController(quotationService);


router.post('/create',authenticate,quotationController.createDraft.bind(quotationController));


export default router