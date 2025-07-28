import { Router } from 'express';
import notificationController from './notification.controller.js';
import NotificationValidation from './notification.validation.js';
import { validateData } from '../../middlewares/validation.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';

const router = Router();

// Routes cho user (cần auth)
router.get(
	'/',
	authMiddleware,
	validateData(NotificationValidation.getNotifications, 'query'),
	notificationController.getUserNotifications
);

router.get(
	'/unread-count',
	authMiddleware,
	notificationController.getUnreadCount
);

router.get(
	'/stats',
	authMiddleware,
	notificationController.getNotificationStats
);

router.get(
	'/:id',
	authMiddleware,
	validateData(NotificationValidation.mongoId, 'params'),
	notificationController.getNotificationById
);

router.patch(
	'/:id/read',
	authMiddleware,
	validateData(NotificationValidation.mongoId, 'params'),
	notificationController.markAsRead
);

router.patch(
	'/mark-all-read',
	authMiddleware,
	notificationController.markAllAsRead
);

router.delete(
	'/:id',
	authMiddleware,
	validateData(NotificationValidation.mongoId, 'params'),
	notificationController.deleteNotification
);

// Routes cho admin (cần auth + admin permission)
router.post(
	'/',
	authMiddleware,
	checkPermission(['admin']),
	validateData(NotificationValidation.createNotification),
	notificationController.createNotification
);

router.post(
	'/system',
	authMiddleware,
	checkPermission(['admin']),
	validateData(NotificationValidation.createSystemNotification),
	notificationController.createSystemNotification
);

router.get(
	'/type/:type',
	authMiddleware,
	checkPermission(['admin']),
	validateData(NotificationValidation.getNotifications, 'query'),
	notificationController.getNotificationsByType
);

router.delete(
	'/cleanup/expired',
	authMiddleware,
	checkPermission(['admin']),
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
