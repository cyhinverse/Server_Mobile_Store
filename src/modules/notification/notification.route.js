import { Router } from 'express';
import notificationController from './notification.controller.js';
import NotificationValidation from './notification.validation.js';
import { validateData } from '../../middlewares/validation.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import internalApiKeyMiddleware from '../../middlewares/internalApiKey.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = Router();

// ==================== INTERNAL ROUTES (requires internal API key) ====================
router.post(
	'/internal/order',
	internalApiKeyMiddleware,
	validateData(NotificationValidation.createOrderNotification),
	notificationController.createOrderNotification
);

router.post(
	'/internal/promotion',
	internalApiKeyMiddleware,
	validateData(NotificationValidation.createPromotionNotification),
	notificationController.createPromotionNotification
);

// ==================== ADMIN ROUTES ====================
router.post(
	'/system',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.NOTIFICATION_CREATE]),
	validateData(NotificationValidation.createSystemNotification),
	notificationController.createSystemNotification
);

router.delete(
	'/cleanup/expired',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.NOTIFICATION_DELETE]),
	notificationController.cleanupExpiredNotifications
);

router.get(
	'/type/:type',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.NOTIFICATION_READ]),
	validateData(NotificationValidation.getNotifications, 'query'),
	notificationController.getNotificationsByType
);

// ==================== USER STATIC ROUTES ====================
router.get(
	'/unread-count',
	authMiddleware,
	notificationController.getUnreadCount
);

router.get(
	'/stats',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.NOTIFICATION_READ]),
	notificationController.getNotificationStats
);

router.patch(
	'/mark-all-read',
	authMiddleware,
	notificationController.markAllAsRead
);

// Create notification (Admin only)
router.post(
	'/',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.NOTIFICATION_CREATE]),
	validateData(NotificationValidation.createNotification),
	notificationController.createNotification
);

// Get user notifications
router.get(
	'/',
	authMiddleware,
	validateData(NotificationValidation.getNotifications, 'query'),
	notificationController.getUserNotifications
);

// ==================== USER DYNAMIC ROUTES (đặt cuối) ====================
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

router.delete(
	'/:id',
	authMiddleware,
	validateData(NotificationValidation.mongoId, 'params'),
	notificationController.deleteNotification
);

export default router;
