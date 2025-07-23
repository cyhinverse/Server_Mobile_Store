import BaseController from '../../core/controller/base.controller.js';
import notificationService from './notification.service.js';
import { catchAsync } from '../../configs/catchAsync.js';
import {
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class NotificationController extends BaseController {
	constructor() {
		super(notificationService);
	}

	// Lấy thông báo của user hiện tại
	getUserNotifications = catchAsync(async (req, res) => {
		const userId = req.user.id;
		const options = {
			page: parseInt(req.query.page) || 1,
			limit: parseInt(req.query.limit) || 20,
			status: req.query.status,
			type: req.query.type,
			sort: req.query.sort || '-createdAt',
		};

		const result = await notificationService.getNotificationsByUser(
			userId,
			options
		);

		return formatSuccess(
			res,
			result,
			'Notifications retrieved successfully',
			200
		);
	});

	// Đếm thông báo chưa đọc
	getUnreadCount = catchAsync(async (req, res) => {
		const userId = req.user.id;
		const count = await notificationService.getUnreadCount(userId);

		return formatSuccess(
			res,
			{ unreadCount: count },
			'Unread count retrieved successfully',
			200
		);
	});

	// Tạo thông báo mới (Admin only)
	createNotification = catchAsync(async (req, res) => {
		const notification = await notificationService.createNotification(req.body);

		return formatSuccess(
			res,
			notification,
			'Notification created successfully',
			201
		);
	});

	// Tạo thông báo hệ thống cho nhiều user (Admin only)
	createSystemNotification = catchAsync(async (req, res) => {
		const { userIds, title, content, metadata } = req.body;

		if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
			return formatFail(res, 'User IDs array is required', 400);
		}

		if (!title || !content) {
			return formatFail(res, 'Title and content are required', 400);
		}

		const notifications = await notificationService.createSystemNotification(
			userIds,
			title,
			content,
			metadata
		);

		return formatSuccess(
			res,
			{ created: notifications.length },
			'System notifications created successfully',
			201
		);
	});

	// Đánh dấu thông báo đã đọc
	markAsRead = catchAsync(async (req, res) => {
		const { id } = req.params;
		const userId = req.user.id;

		const notification = await notificationService.markAsRead(id, userId);

		return formatSuccess(res, notification, 'Notification marked as read', 200);
	});

	// Đánh dấu tất cả thông báo đã đọc
	markAllAsRead = catchAsync(async (req, res) => {
		const userId = req.user.id;

		const result = await notificationService.markAllAsRead(userId);

		return formatSuccess(
			res,
			{ modifiedCount: result.modifiedCount },
			'All notifications marked as read',
			200
		);
	});

	// Xóa thông báo
	deleteNotification = catchAsync(async (req, res) => {
		const { id } = req.params;
		const userId = req.user.id;

		const notification = await notificationService.deleteNotification(
			id,
			userId
		);

		return formatSuccess(
			res,
			notification,
			'Notification deleted successfully',
			200
		);
	});

	// Lấy thông báo theo type (Admin only)
	getNotificationsByType = catchAsync(async (req, res) => {
		const { type } = req.params;
		const options = {
			page: parseInt(req.query.page) || 1,
			limit: parseInt(req.query.limit) || 20,
			sort: req.query.sort || '-createdAt',
		};

		const result = await notificationService.getNotificationsByType(
			type,
			options
		);

		return formatSuccess(
			res,
			result,
			`Notifications of type ${type} retrieved successfully`,
			200
		);
	});

	// Lấy thống kê thông báo của user
	getNotificationStats = catchAsync(async (req, res) => {
		const userId = req.user.id;

		const stats = await notificationService.getNotificationStats(userId);

		return formatSuccess(
			res,
			stats,
			'Notification statistics retrieved successfully',
			200
		);
	});

	// Dọn dẹp thông báo hết hạn (Admin only)
	cleanupExpiredNotifications = catchAsync(async (req, res) => {
		const result = await notificationService.cleanupExpiredNotifications();

		return formatSuccess(
			res,
			{ deletedCount: result.deletedCount },
			'Expired notifications cleaned up successfully',
			200
		);
	});

	// Lấy chi tiết một thông báo
	getNotificationById = catchAsync(async (req, res) => {
		const { id } = req.params;
		const userId = req.user.id;

		const notification = await notificationService.findById(id);

		// Kiểm tra quyền truy cập
		if (notification.user.toString() !== userId) {
			return formatFail(res, 'Access denied', 403);
		}

		return formatSuccess(
			res,
			notification,
			'Notification retrieved successfully',
			200
		);
	});

	// Tạo thông báo đơn hàng (Internal use)
	createOrderNotification = catchAsync(async (req, res) => {
		const { userId, orderId, orderStatus, orderData } = req.body;

		if (!userId || !orderId || !orderStatus || !orderData) {
			return formatFail(res, 'Missing required fields', 400);
		}

		const notification = await notificationService.createOrderNotification(
			userId,
			orderId,
			orderStatus,
			orderData
		);

		return formatSuccess(
			res,
			notification,
			'Order notification created successfully',
			201
		);
	});

	// Tạo thông báo khuyến mãi (Internal use)
	createPromotionNotification = catchAsync(async (req, res) => {
		const { userId, promotionId, promotionData } = req.body;

		if (!userId || !promotionId || !promotionData) {
			return formatFail(res, 'Missing required fields', 400);
		}

		const notification = await notificationService.createPromotionNotification(
			userId,
			promotionId,
			promotionData
		);

		return formatSuccess(
			res,
			notification,
			'Promotion notification created successfully',
			201
		);
	});
}

export default new NotificationController();
