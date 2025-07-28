import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import NotificationService from './notification.service.js';
import NotificationValidation from './notification.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

/**
 * Notification Controller - HTTP Request/Response Handler
 * Follows 3-tier architecture: only handles HTTP layer
 * - Validates request parameters and body
 * - Delegates business logic to Service layer
 * - Formats and sends HTTP responses
 */
class NotificationController {
	constructor() {
		if (NotificationController.instance) return NotificationController.instance;
		NotificationController.instance = this;
	}

	/**
	 * Get user notifications with filtering and pagination
	 * GET /api/notifications
	 */
	getUserNotifications = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.queryNotification.validate(
			req.query,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const userId = req.user.id;
			const result = await NotificationService.getUserNotifications(userId, value);

			return formatSuccess({
				res,
				message: 'Notifications retrieved successfully',
				data: result,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve notifications',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get unread notification count
	 * GET /api/notifications/unread-count
	 */
	getUnreadCount = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const count = await NotificationService.getUnreadCount(userId);

			return formatSuccess({
				res,
				message: 'Unread count retrieved successfully',
				data: { unreadCount: count },
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve unread count',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Create new notification (Admin only)
	 * POST /api/notifications
	 */
	createNotification = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.createNotification.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const notification = await NotificationService.createNotification(value);

			return formatSuccess({
				res,
				message: 'Notification created successfully',
				data: notification,
				code: StatusCodes.CREATED,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to create notification',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Create system notifications for multiple users (Admin only)
	 * POST /api/notifications/system
	 */
	createSystemNotification = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.createSystemNotification.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const notifications = await NotificationService.createSystemNotification(
				value.userIds,
				value.title,
				value.content,
				value.metadata
			);

			return formatSuccess({
				res,
				message: 'System notifications created successfully',
				data: { created: notifications.length },
				code: StatusCodes.CREATED,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to create system notifications',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get notification by ID
	 * GET /api/notifications/:id
	 */
	getNotificationById = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.notificationId.validate(
			req.params,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Invalid notification ID',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const userId = req.user.id;
			const notification = await NotificationService.getNotificationById(
				value.id,
				userId
			);

			return formatSuccess({
				res,
				message: 'Notification retrieved successfully',
				data: notification,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve notification',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Mark notification as read
	 * PATCH /api/notifications/:id/read
	 */
	markAsRead = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.notificationId.validate(
			req.params,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Invalid notification ID',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const userId = req.user.id;
			const notification = await NotificationService.markAsRead(value.id, userId);

			return formatSuccess({
				res,
				message: 'Notification marked as read',
				data: notification,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to mark notification as read',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Mark all notifications as read
	 * PATCH /api/notifications/read-all
	 */
	markAllAsRead = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const result = await NotificationService.markAllAsRead(userId);

			return formatSuccess({
				res,
				message: 'All notifications marked as read',
				data: { modifiedCount: result.modifiedCount },
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to mark all notifications as read',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Delete notification
	 * DELETE /api/notifications/:id
	 */
	deleteNotification = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.notificationId.validate(
			req.params,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Invalid notification ID',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const userId = req.user.id;
			await NotificationService.deleteNotification(value.id, userId);

			return formatSuccess({
				res,
				message: 'Notification deleted successfully',
				data: null,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to delete notification',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get notifications by type (Admin only)
	 * GET /api/notifications/type/:type
	 */
	getNotificationsByType = catchAsync(async (req, res) => {
		const paramsValidation = NotificationValidation.notificationType.validate(
			req.params
		);
		const queryValidation = NotificationValidation.queryNotification.validate(
			req.query,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (paramsValidation.error) {
			const errorMessages = paramsValidation.error.details.map(
				(err) => err.message
			);
			return formatFail({
				res,
				message: 'Invalid notification type',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		if (queryValidation.error) {
			const errorMessages = queryValidation.error.details.map(
				(err) => err.message
			);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const result = await NotificationService.getNotificationsByType(
				paramsValidation.value.type,
				queryValidation.value
			);

			return formatSuccess({
				res,
				message: `Notifications of type ${paramsValidation.value.type} retrieved successfully`,
				data: result,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve notifications by type',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get notification statistics
	 * GET /api/notifications/stats
	 */
	getNotificationStats = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const stats = await NotificationService.getNotificationStats(userId);

			return formatSuccess({
				res,
				message: 'Notification statistics retrieved successfully',
				data: stats,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve notification statistics',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Clean up expired notifications (Admin only)
	 * DELETE /api/notifications/cleanup
	 */
	cleanupExpiredNotifications = catchAsync(async (req, res) => {
		try {
			const result = await NotificationService.cleanupExpiredNotifications();

			return formatSuccess({
				res,
				message: 'Expired notifications cleaned up successfully',
				data: { deletedCount: result.deletedCount },
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to cleanup expired notifications',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Create order notification (Internal use)
	 * POST /api/notifications/order
	 */
	createOrderNotification = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.createOrderNotification.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const notification = await NotificationService.createOrderNotification(
				value.userId,
				value.orderId,
				value.orderStatus,
				value.orderData
			);

			return formatSuccess({
				res,
				message: 'Order notification created successfully',
				data: notification,
				code: StatusCodes.CREATED,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to create order notification',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Create promotion notification (Internal use)
	 * POST /api/notifications/promotion
	 */
	createPromotionNotification = catchAsync(async (req, res) => {
		const { error, value } = NotificationValidation.createPromotionNotification.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const notification = await NotificationService.createPromotionNotification(
				value.userId,
				value.promotionId,
				value.promotionData
			);

			return formatSuccess({
				res,
				message: 'Promotion notification created successfully',
				data: notification,
				code: StatusCodes.CREATED,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to create promotion notification',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
}

export default new NotificationController();
