import BaseService from '../../core/service/base.service.js';
import notificationRepository from './notification.repository.js';
import { emitCreateNotification } from '../../events/notification.event.js';

class NotificationService extends BaseService {
	constructor() {
		super(notificationRepository);
		this.repository = notificationRepository;
	}

	// Lấy thông báo theo user
	async getNotificationsByUser(userId, options = {}) {
		if (!userId) throw new Error('User ID is required');
		return await this.repository.getNotificationsByUser(userId, options);
	}

	// Đếm thông báo chưa đọc
	async getUnreadCount(userId) {
		try {
			return await this.repository.getUnreadCount(userId);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Tạo thông báo mới
	async createNotification(data) {
		try {
			const {
				userId,
				type,
				title,
				content,
				metadata = {},
				priority = 'medium',
				expiresAt = null,
				imageUrl = null,
			} = data;

			if (!userId || !type || !title || !content)
				throw new Error('User, type, title and content are required');

			const validTypes = [
				'order',
				'promotion',
				'system',
				'account',
				'delivery',
			];
			if (!validTypes.includes(type))
				throw new Error('Invalid notification type');

			const validPriorities = ['high', 'medium', 'low'];
			if (!validPriorities.includes(priority))
				throw new Error('Invalid priority level');

			const notificationData = {
				user: userId,
				type,
				title,
				content,
				metadata,
				priority,
				imageUrl,
				scheduledAt: new Date(),
			};

			if (expiresAt) {
				notificationData.expiresAt = new Date(expiresAt);
			}

			const notification = await this.repository.create(notificationData);
			await emitCreateNotification(userId, notification);
			return notification;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Tạo thông báo đơn hàng
	async createOrderNotification(userId, orderId, orderStatus, orderData) {
		try {
			let title, content;

			switch (orderStatus) {
				case 'confirmed':
					title = { vi: 'Đơn hàng đã được xác nhận', en: 'Order confirmed' };
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} của bạn đã được xác nhận và đang được chuẩn bị.`,
						en: `Your order #${orderData.orderNumber} has been confirmed and is being prepared.`,
					};
					break;
				case 'shipped':
					title = { vi: 'Đơn hàng đang được giao', en: 'Order shipped' };
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} đang trên đường giao đến bạn.`,
						en: `Your order #${orderData.orderNumber} is on the way.`,
					};
					break;
				case 'delivered':
					title = { vi: 'Đơn hàng đã được giao', en: 'Order delivered' };
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} đã được giao thành công.`,
						en: `Your order #${orderData.orderNumber} has been delivered successfully.`,
					};
					break;
				case 'cancelled':
					title = { vi: 'Đơn hàng đã bị hủy', en: 'Order cancelled' };
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} đã bị hủy.`,
						en: `Your order #${orderData.orderNumber} has been cancelled.`,
					};
					break;
				default:
					throw new Error('Invalid order status');
			}

			return await this.createNotification({
				userId,
				type: 'order',
				title,
				content,
				metadata: {
					orderId,
					deepLink: `/orders/${orderId}`,
					icon: 'order',
				},
				priority: 'high',
			});
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Tạo thông báo khuyến mãi
	async createPromotionNotification(userId, promotionId, promotionData) {
		try {
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
					deepLink: `/promotions/${promotionId}`,
					icon: 'promotion',
				},
				priority: 'medium',
				expiresAt: promotionData.endDate,
			});
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Tạo thông báo hệ thống
	async createSystemNotification(userIds, title, content, metadata = {}) {
		try {
			const notifications = userIds.map((userId) => ({
				user: userId,
				type: 'system',
				title,
				content,
				metadata: {
					...metadata,
					icon: 'system',
				},
				priority: 'medium',
			}));

			return await this.repository.createBulkNotifications(notifications);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Đánh dấu đã đọc
	async markAsRead(notificationId, userId) {
		try {
			const notification = await this.repository.markAsRead(
				notificationId,
				userId
			);
			if (!notification)
				throw new Error('Notification not found or access denied');
			return notification;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Đánh dấu tất cả đã đọc
	async markAllAsRead(userId) {
		try {
			return await this.repository.markAllAsRead(userId);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Xóa thông báo
	async deleteNotification(notificationId, userId) {
		try {
			const notification = await this.repository.softDelete(
				notificationId,
				userId
			);
			if (!notification)
				throw new Error('Notification not found or access denied');
			return notification;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Lấy thông báo theo type
	async getNotificationsByType(type, options = {}) {
		try {
			return await this.repository.getNotificationsByType(type, options);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Dọn dẹp thông báo hết hạn
	async cleanupExpiredNotifications() {
		try {
			return await this.repository.deleteExpiredNotifications();
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Lấy thống kê
	async getNotificationStats(userId) {
		try {
			const [total, unread, read] = await Promise.all([
				this.repository.model.countDocuments({
					user: userId,
					status: { $ne: 'deleted' },
				}),
				this.repository.model.countDocuments({
					user: userId,
					status: 'unread',
				}),
				this.repository.model.countDocuments({
					user: userId,
					status: 'read',
				}),
			]);

			return {
				total,
				unread,
				read,
				readPercentage: total > 0 ? Math.round((read / total) * 100) : 0,
			};
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export default new NotificationService();
