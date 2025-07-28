import BaseService from '../../core/service/base.service.js';
import notificationRepository from './notification.repository.js';
import { emitCreateNotification } from '../../events/notification.event.js';

/**
 * Notification Service - Business Logic Layer
 * Handles all business rules, validation, and data processing
 * No direct database access - uses Repository layer
 */
class NotificationService extends BaseService {
	constructor() {
		super(notificationRepository);
		this.repository = notificationRepository;
	}

	/**
	 * Get user notifications with filtering and pagination
	 */
	async getUserNotifications(userId, query = {}) {
		// Validate user ID
		if (!userId) {
			const error = new Error('User ID is required');
			error.statusCode = 400;
			throw error;
		}

		// Prepare filter options
		const filter = {};
		if (query.status) filter.status = query.status;
		if (query.type) filter.type = query.type;

		const options = {
			page: parseInt(query.page) || 1,
			limit: Math.min(parseInt(query.limit) || 20, 100), // Max 100 items
			sort: this._buildSortOptions(query.sort),
		};

		const result = await this.repository.findByUserId(userId, filter, options);

		return {
			notifications: result.notifications,
			pagination: {
				page: result.page,
				limit: result.limit,
				total: result.total,
				totalPages: result.totalPages,
			},
		};
	}

	/**
	 * Get unread notification count for user
	 */
	async getUnreadCount(userId) {
		if (!userId) {
			const error = new Error('User ID is required');
			error.statusCode = 400;
			throw error;
		}

		return await this.repository.countUnreadByUserId(userId);
	}

	/**
	 * Create new notification
	 */
	async createNotification(data) {
		// Validate required fields
		const { userId, type, title, content } = data;
		
		if (!userId || !type || !title || !content) {
			const error = new Error('User ID, type, title and content are required');
			error.statusCode = 400;
			throw error;
		}

		// Validate notification type
		if (!this._isValidNotificationType(type)) {
			const error = new Error('Invalid notification type');
			error.statusCode = 400;
			throw error;
		}

		// Validate priority
		const priority = data.priority || 'medium';
		if (!this._isValidPriority(priority)) {
			const error = new Error('Invalid priority level');
			error.statusCode = 400;
			throw error;
		}

		// Prepare notification data
		const notificationData = {
			user_id: userId,
			type,
			title: this._normalizeTitle(title),
			content: this._normalizeContent(content),
			metadata: data.metadata || {},
			priority,
			scheduledAt: data.scheduledAt || new Date(),
			expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
		};

		// Create notification
		const notification = await this.repository.create(notificationData);

		// Emit event for real-time notifications
		try {
			await emitCreateNotification(userId, notification);
		} catch (eventError) {
			// Log but don't fail the notification creation
			console.warn('Failed to emit notification event:', eventError.message);
		}

		return notification;
	}

	/**
	 * Create order-related notification
	 */
	async createOrderNotification(userId, orderId, orderStatus, orderData) {
		if (!userId || !orderId || !orderStatus || !orderData) {
			const error = new Error('All order notification parameters are required');
			error.statusCode = 400;
			throw error;
		}

		const notificationContent = this._buildOrderNotificationContent(orderStatus, orderData);

		return await this.createNotification({
			userId,
			type: 'order',
			title: notificationContent.title,
			content: notificationContent.content,
			metadata: {
				orderId,
				orderStatus,
				orderNumber: orderData.orderNumber,
				deepLink: `/orders/${orderId}`,
				icon: 'order',
			},
			priority: this._getOrderNotificationPriority(orderStatus),
		});
	}

	/**
	 * Create promotion notification
	 */
	async createPromotionNotification(userId, promotionId, promotionData) {
		if (!userId || !promotionId || !promotionData) {
			const error = new Error('All promotion notification parameters are required');
			error.statusCode = 400;
			throw error;
		}

		const title = {
			vi: 'Khuyến mãi mới dành cho bạn!',
			en: 'New promotion for you!',
		};

		const content = {
			vi: `${promotionData.title} - Giảm ${promotionData.discountValue}%. Không bỏ lỡ!`,
			en: `${promotionData.title} - ${promotionData.discountValue}% off. Don't miss out!`,
		};

		return await this.createNotification({
			userId,
			type: 'promotion',
			title,
			content,
			metadata: {
				promotionId,
				promotionTitle: promotionData.title,
				discountValue: promotionData.discountValue,
				deepLink: `/promotions/${promotionId}`,
				icon: 'promotion',
			},
			priority: 'medium',
			expiresAt: promotionData.endDate,
		});
	}

	/**
	 * Create system notifications for multiple users
	 */
	async createSystemNotification(userIds, title, content, metadata = {}) {
		if (!Array.isArray(userIds) || userIds.length === 0) {
			const error = new Error('User IDs array is required and cannot be empty');
			error.statusCode = 400;
			throw error;
		}

		if (!title || !content) {
			const error = new Error('Title and content are required');
			error.statusCode = 400;
			throw error;
		}

		const notifications = userIds.map(userId => ({
			user_id: userId,
			type: 'system',
			title: this._normalizeTitle(title),
			content: this._normalizeContent(content),
			metadata: {
				...metadata,
				icon: 'system',
			},
			priority: 'medium',
			scheduledAt: new Date(),
		}));

		const result = await this.repository.createMany(notifications);

		// Emit events for real-time notifications
		try {
			await Promise.all(
				result.map(notification => 
					emitCreateNotification(notification.user_id, notification)
				)
			);
		} catch (eventError) {
			console.warn('Failed to emit system notification events:', eventError.message);
		}

		return result;
	}

	/**
	 * Mark notification as read
	 */
	async markAsRead(notificationId, userId) {
		if (!notificationId || !userId) {
			const error = new Error('Notification ID and User ID are required');
			error.statusCode = 400;
			throw error;
		}

		const notification = await this.repository.markAsReadById(notificationId, userId);

		if (!notification) {
			const error = new Error('Notification not found or access denied');
			error.statusCode = 404;
			throw error;
		}

		return notification;
	}

	/**
	 * Mark all user notifications as read
	 */
	async markAllAsRead(userId) {
		if (!userId) {
			const error = new Error('User ID is required');
			error.statusCode = 400;
			throw error;
		}

		return await this.repository.markAllAsReadByUserId(userId);
	}

	/**
	 * Delete notification (soft delete)
	 */
	async deleteNotification(notificationId, userId) {
		if (!notificationId || !userId) {
			const error = new Error('Notification ID and User ID are required');
			error.statusCode = 400;
			throw error;
		}

		const notification = await this.repository.softDeleteById(notificationId, userId);

		if (!notification) {
			const error = new Error('Notification not found or access denied');
			error.statusCode = 404;
			throw error;
		}

		return notification;
	}

	/**
	 * Get notification by ID
	 */
	async getNotificationById(notificationId, userId) {
		if (!notificationId || !userId) {
			const error = new Error('Notification ID and User ID are required');
			error.statusCode = 400;
			throw error;
		}

		const notification = await this.repository.findByIdAndUserId(notificationId, userId);

		if (!notification) {
			const error = new Error('Notification not found or access denied');
			error.statusCode = 404;
			throw error;
		}

		return notification;
	}

	/**
	 * Get notifications by type (Admin only)
	 */
	async getNotificationsByType(type, query = {}) {
		if (!type) {
			const error = new Error('Notification type is required');
			error.statusCode = 400;
			throw error;
		}

		if (!this._isValidNotificationType(type)) {
			const error = new Error('Invalid notification type');
			error.statusCode = 400;
			throw error;
		}

		const options = {
			page: parseInt(query.page) || 1,
			limit: Math.min(parseInt(query.limit) || 20, 100),
			sort: this._buildSortOptions(query.sort),
		};

		const result = await this.repository.findByType(type, options);

		return {
			notifications: result.notifications,
			pagination: {
				page: result.page,
				limit: result.limit,
				total: result.total,
				totalPages: result.totalPages,
			},
		};
	}

	/**
	 * Get notification statistics for user
	 */
	async getNotificationStats(userId) {
		if (!userId) {
			const error = new Error('User ID is required');
			error.statusCode = 400;
			throw error;
		}

		const stats = await this.repository.getStatsByUserId(userId);

		return {
			total: stats.overall.total,
			unread: stats.overall.unread,
			read: stats.overall.read,
			readPercentage: stats.overall.total > 0 
				? Math.round((stats.overall.read / stats.overall.total) * 100) 
				: 0,
			byType: stats.byType,
		};
	}

	/**
	 * Clean up expired notifications
	 */
	async cleanupExpiredNotifications() {
		return await this.repository.deleteExpired();
	}

	// Private helper methods
	_isValidNotificationType(type) {
		const validTypes = ['order', 'promotion', 'system', 'account', 'delivery'];
		return validTypes.includes(type);
	}

	_isValidPriority(priority) {
		const validPriorities = ['high', 'medium', 'low'];
		return validPriorities.includes(priority);
	}

	_normalizeTitle(title) {
		if (typeof title === 'string') {
			return { vi: title, en: title };
		}
		return title;
	}

	_normalizeContent(content) {
		if (typeof content === 'string') {
			return { vi: content, en: content };
		}
		return content;
	}

	_buildSortOptions(sortQuery) {
		if (!sortQuery) return { createdAt: -1 };

		const sortMap = {
			'newest': { createdAt: -1 },
			'oldest': { createdAt: 1 },
			'priority': { priority: -1, createdAt: -1 },
			'type': { type: 1, createdAt: -1 },
		};

		return sortMap[sortQuery] || { createdAt: -1 };
	}

	_buildOrderNotificationContent(orderStatus, orderData) {
		const contentMap = {
			confirmed: {
				title: { vi: 'Đơn hàng đã được xác nhận', en: 'Order confirmed' },
				content: {
					vi: `Đơn hàng #${orderData.orderNumber} của bạn đã được xác nhận và đang được chuẩn bị.`,
					en: `Your order #${orderData.orderNumber} has been confirmed and is being prepared.`,
				},
			},
			shipped: {
				title: { vi: 'Đơn hàng đang được giao', en: 'Order shipped' },
				content: {
					vi: `Đơn hàng #${orderData.orderNumber} đang trên đường giao đến bạn.`,
					en: `Your order #${orderData.orderNumber} is on the way.`,
				},
			},
			delivered: {
				title: { vi: 'Đơn hàng đã được giao', en: 'Order delivered' },
				content: {
					vi: `Đơn hàng #${orderData.orderNumber} đã được giao thành công.`,
					en: `Your order #${orderData.orderNumber} has been delivered successfully.`,
				},
			},
			cancelled: {
				title: { vi: 'Đơn hàng đã bị hủy', en: 'Order cancelled' },
				content: {
					vi: `Đơn hàng #${orderData.orderNumber} đã bị hủy.`,
					en: `Your order #${orderData.orderNumber} has been cancelled.`,
				},
			},
		};

		const content = contentMap[orderStatus];
		if (!content) {
			const error = new Error('Invalid order status');
			error.statusCode = 400;
			throw error;
		}

		return content;
	}

	_getOrderNotificationPriority(orderStatus) {
		const priorityMap = {
			confirmed: 'high',
			shipped: 'high',
			delivered: 'medium',
			cancelled: 'high',
		};

		return priorityMap[orderStatus] || 'medium';
	}
}

export default new NotificationService();
