import { Router } from 'express';
import notificationController from './notification.controller.js';
import NotificationValidation from './notification.validation.js';
import { validateData } from '../../middlewares/validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/permission.js';

const router = Router();

// Middleware xác thực cho tất cả routes
router.use(authenticate);

// Routes cho user
router.get(
	'/my-notifications',
	validateData(NotificationValidation.getNotifications, 'query'),
	notificationController.getUserNotifications
);

router.get('/unread-count', notificationController.getUnreadCount);

router.get('/stats', notificationController.getNotificationStats);

router.get(
	'/:id',
	validateData(NotificationValidation.mongoId, 'params'),
	notificationController.getNotificationById
);

router.patch(
	'/:id/read',
	validateData(NotificationValidation.mongoId, 'params'),
	notificationController.markAsRead
);

router.patch('/mark-all-read', notificationController.markAllAsRead);

router.delete(
	'/:id',
	validateData(NotificationValidation.mongoId, 'params'),
	notificationController.deleteNotification
);

// Routes cho admin
router.post(
	'/',
	authorize(['admin']),
	validateData(NotificationValidation.createNotification),
	notificationController.createNotification
);

router.post(
	'/system',
	authorize(['admin']),
	validateData(NotificationValidation.createSystemNotification),
	notificationController.createSystemNotification
);

router.get(
	'/type/:type',
	authorize(['admin']),
	validateData(NotificationValidation.getNotifications, 'query'),
	notificationController.getNotificationsByType
);

router.delete(
	'/cleanup/expired',
	authorize(['admin']),
	notificationController.cleanupExpiredNotifications
);

// Routes cho internal services (không cần auth, chỉ dùng trong server)
router.post(
	'/internal/order',
	validateData(NotificationValidation.createOrderNotification),
	notificationController.createOrderNotification
);

router.post(
	'/internal/promotion',
	validateData(NotificationValidation.createPromotionNotification),
	notificationController.createPromotionNotification
);

export default router;
