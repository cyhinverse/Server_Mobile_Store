import BaseRepository from '../../core/repository/base.repository.js';
import Notification from './notification.model.js';

class NotificationRepository extends BaseRepository {
	constructor() {
		super(Notification);
	}

	async getNotificationsByUser(userId, options = {}) {
		try {
			const {
				page = 1,
				limit = 20,
				status = null,
				type = null,
				sort = '-createdAt',
			} = options;

			const skip = (page - 1) * limit;
			const query = { user: userId };

			if (status) query.status = status;
			if (type) query.type = type;

			const notifications = await this.model
				.find(query)
				.populate('metadata.orderId', 'orderNumber status totalAmount')
				.populate('metadata.promotionId', 'title description discountValue')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments(query);

			return {
				notifications,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			throw new Error('Error getting notifications by user: ' + error.message);
		}
	}

	// Đếm thông báo chưa đọc
	async getUnreadCount(userId) {
		try {
			return await this.model.countDocuments({
				user: userId,
				status: 'unread',
			});
		} catch (error) {
			throw new Error('Error getting unread count: ' + error.message);
		}
	}

	// Đánh dấu đã đọc một thông báo
	async markAsRead(notificationId, userId) {
		try {
			return await this.model.findOneAndUpdate(
				{ _id: notificationId, user: userId },
				{ status: 'read' },
				{ new: true }
			);
		} catch (error) {
			throw new Error('Error marking notification as read: ' + error.message);
		}
	}

	// Đánh dấu đã đọc tất cả thông báo của user
	async markAllAsRead(userId) {
		try {
			return await this.model.updateMany(
				{ user: userId, status: 'unread' },
				{ status: 'read' }
			);
		} catch (error) {
			throw new Error(
				'Error marking all notifications as read: ' + error.message
			);
		}
	}

	// Xóa thông báo (soft delete)
	async softDelete(notificationId, userId) {
		try {
			return await this.model.findOneAndUpdate(
				{ _id: notificationId, user: userId },
				{ status: 'deleted' },
				{ new: true }
			);
		} catch (error) {
			throw new Error('Error soft deleting notification: ' + error.message);
		}
	}

	// Xóa thông báo đã hết hạn
	async deleteExpiredNotifications() {
		try {
			return await this.model.deleteMany({
				expiresAt: { $lt: new Date() },
			});
		} catch (error) {
			throw new Error('Error deleting expired notifications: ' + error.message);
		}
	}

	// Tạo thông báo hàng loạt
	async createBulkNotifications(notifications) {
		try {
			return await this.model.insertMany(notifications);
		} catch (error) {
			throw new Error('Error creating bulk notifications: ' + error.message);
		}
	}

	// Lấy thông báo theo type
	async getNotificationsByType(type, options = {}) {
		try {
			const { page = 1, limit = 20, sort = '-createdAt' } = options;

			const skip = (page - 1) * limit;
			const query = { type };

			const notifications = await this.model
				.find(query)
				.populate('user', 'fullName email')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments(query);

			return {
				notifications,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			throw new Error('Error getting notifications by type: ' + error.message);
		}
	}
}

export default new NotificationRepository();
