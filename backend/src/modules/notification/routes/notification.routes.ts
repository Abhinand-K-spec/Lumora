import {Router} from 'express';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationService } from '../services/NotificationService';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../../../shared/middlewares/auth.middleware';

const router = Router();



const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);


router.get('/',authenticate,notificationController.getNotifications.bind(notificationController));
router.get('/unread-count',authenticate,notificationController.getUnreadCount.bind(notificationController));
router.patch('/read-all',authenticate,notificationController.markAllAsRead.bind(notificationController));
router.patch('/:id/read',authenticate,notificationController.markAsRead.bind(notificationController));

export default router;