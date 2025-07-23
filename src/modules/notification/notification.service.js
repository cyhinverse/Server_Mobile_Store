import BaseService from '../../core/service/base.service.js';
import notificationRepository from './notification.repository.js';

class NotificationService extends BaseService {
	constructor() {
		super(notificationRepository);
	}

	// Lấy thông báo theo user
	async getNotificationsByUser(userId, options = {}) {
		try {
			return await notificationRepository.getNotificationsByUser(
				userId,
				options
			);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Đếm thông báo chưa đọc
	async getUnreadCount(userId) {
		try {
			return await notificationRepository.getUnreadCount(userId);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Tạo thông báo mới
	async createNotification(data) {
		try {
			const {
				user,
				type,
				title,
				content,
				metadata = {},
				priority = 'medium',
				expiresAt = null,
				imageUrl = null,
			} = data;

			// Validate required fields
			if (!user || !type || !title || !content) {
				throw new Error('User, type, title and content are required');
			}

			// Validate type
			const validTypes = [
				'order',
				'promotion',
				'system',
				'account',
				'delivery',
			];
			if (!validTypes.includes(type)) {
				throw new Error('Invalid notification type');
			}

			// Validate priority
			const validPriorities = ['high', 'medium', 'low'];
			if (!validPriorities.includes(priority)) {
				throw new Error('Invalid priority level');
			}

			const notificationData = {
				user,
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

			return await this.repository.create(notificationData);
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
					title = {
						vi: 'Đơn hàng đã được xác nhận',
						en: 'Order confirmed',
					};
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} của bạn đã được xác nhận và đang được chuẩn bị.`,
						en: `Your order #${orderData.orderNumber} has been confirmed and is being prepared.`,
					};
					break;
				case 'shipped':
					title = {
						vi: 'Đơn hàng đang được giao',
						en: 'Order shipped',
					};
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} đang trên đường giao đến bạn.`,
						en: `Your order #${orderData.orderNumber} is on the way.`,
					};
					break;
				case 'delivered':
					title = {
						vi: 'Đơn hàng đã được giao',
						en: 'Order delivered',
					};
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} đã được giao thành công.`,
						en: `Your order #${orderData.orderNumber} has been delivered successfully.`,
					};
					break;
				case 'cancelled':
					title = {
						vi: 'Đơn hàng đã bị hủy',
						en: 'Order cancelled',
					};
					content = {
						vi: `Đơn hàng #${orderData.orderNumber} đã bị hủy.`,
						en: `Your order #${orderData.orderNumber} has been cancelled.`,
					};
					break;
				default:
					throw new Error('Invalid order status');
			}

			return await this.createNotification({
				user: userId,
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
				user: userId,
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

			return await notificationRepository.createBulkNotifications(
				notifications
			);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Đánh dấu đã đọc
	async markAsRead(notificationId, userId) {
		try {
			const notification = await notificationRepository.markAsRead(
				notificationId,
				userId
			);
			if (!notification) {
				throw new Error('Notification not found or access denied');
			}
			return notification;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Đánh dấu tất cả đã đọc
	async markAllAsRead(userId) {
		try {
			return await notificationRepository.markAllAsRead(userId);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Xóa thông báo
	async deleteNotification(notificationId, userId) {
		try {
			const notification = await notificationRepository.softDelete(
				notificationId,
				userId
			);
			if (!notification) {
				throw new Error('Notification not found or access denied');
			}
			return notification;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Lấy thông báo theo type
	async getNotificationsByType(type, options = {}) {
		try {
			return await notificationRepository.getNotificationsByType(type, options);
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Dọn dẹp thông báo hết hạn (chạy định kỳ)
	async cleanupExpiredNotifications() {
		try {
			return await notificationRepository.deleteExpiredNotifications();
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// Lấy thống kê thông báo
	async getNotificationStats(userId) {
		try {
			const [total, unread, read] = await Promise.all([
				notificationRepository.model.countDocuments({
					user: userId,
					status: { $ne: 'deleted' },
				}),
				notificationRepository.model.countDocuments({
					user: userId,
					status: 'unread',
				}),
				notificationRepository.model.countDocuments({
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
