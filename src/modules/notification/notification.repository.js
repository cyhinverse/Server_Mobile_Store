import BaseRepository from '../../core/repository/base.repository.js';
import Notification from './notification.model.js';

/**
 * Notification Repository - Data Access Layer
 * Responsible for direct database operations only
 * No business logic or validation
 */
class NotificationRepository extends BaseRepository {
	constructor() {
		super(Notification);
	}

	/**
	 * Get notifications by user with filtering and pagination
	 */
	async findByUserId(userId, filter = {}, options = {}) {
		const query = { user_id: userId, ...filter };
		const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

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
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	/**
	 * Count unread notifications for a user
	 */
	async countUnreadByUserId(userId) {
		return await this.model.countDocuments({
			user_id: userId,
			status: 'unread',
		});
	}

	/**
	 * Mark notification as read
	 */
	async markAsReadById(notificationId, userId) {
		return await this.model.findOneAndUpdate(
			{ _id: notificationId, user_id: userId },
			{ status: 'read', readAt: new Date() },
			{ new: true }
		);
	}

	/**
	 * Mark all notifications as read for a user
	 */
	async markAllAsReadByUserId(userId) {
		return await this.model.updateMany(
			{ user_id: userId, status: 'unread' },
			{ status: 'read', readAt: new Date() }
		);
	}

	/**
	 * Soft delete notification
	 */
	async softDeleteById(notificationId, userId) {
		return await this.model.findOneAndUpdate(
			{ _id: notificationId, user_id: userId },
			{ status: 'deleted', deletedAt: new Date() },
			{ new: true }
		);
	}

	/**
	 * Find notifications by type with pagination
	 */
	async findByType(type, options = {}) {
		const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		const notifications = await this.model
			.find({ type })
			.populate('user_id', 'fullName email')
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await this.model.countDocuments({ type });

		return {
			notifications,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	/**
	 * Get notification statistics for a user
	 */
	async getStatsByUserId(userId) {
		const stats = await this.model.aggregate([
			{ $match: { user_id: userId } },
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					unread: {
						$sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] },
					},
					read: {
						$sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] },
					},
				},
			},
		]);

		const typeStats = await this.model.aggregate([
			{ $match: { user_id: userId } },
			{
				$group: {
					_id: '$type',
					count: { $sum: 1 },
					unread: {
						$sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] },
					},
				},
			},
		]);

		return {
			overall: stats[0] || { total: 0, unread: 0, read: 0 },
			byType: typeStats,
		};
	}

	/**
	 * Delete expired notifications
	 */
	async deleteExpired() {
		return await this.model.deleteMany({
			expiresAt: { $lt: new Date() },
		});
	}

	/**
	 * Create bulk notifications
	 */
	async createMany(notifications) {
		return await this.model.insertMany(notifications);
	}

	/**
	 * Find notification by ID and user ID
	 */
	async findByIdAndUserId(notificationId, userId) {
		return await this.model
			.findOne({ _id: notificationId, user_id: userId })
			.populate('metadata.orderId', 'orderNumber status totalAmount')
			.populate('metadata.promotionId', 'title description discountValue')
			.lean();
	}

	/**
	 * Find notifications by order ID
	 */
	async findByOrderId(orderId) {
		return await this.model
			.find({ 'metadata.orderId': orderId })
			.sort({ createdAt: -1 })
			.lean();
	}

	/**
	 * Find notifications by promotion ID
	 */
	async findByPromotionId(promotionId) {
		return await this.model
			.find({ 'metadata.promotionId': promotionId })
			.sort({ createdAt: -1 })
			.lean();
	}

	/**
	 * Get scheduled notifications that are ready to send
	 */
	async findScheduledReady() {
		return await this.model
			.find({
				scheduledAt: { $lte: new Date() },
				status: 'unread',
			})
			.lean();
	}
}

export default new NotificationRepository();
