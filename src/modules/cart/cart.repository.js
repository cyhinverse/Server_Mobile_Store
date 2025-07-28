import BaseRepository from '../../core/repository/base.repository.js';
import Cart from './cart.model.js';
import { getPaginationMeta } from '../../shared/response/pagination.js';

class CartRepository extends BaseRepository {
	constructor() {
		super(Cart);
	}

	/**
	 * Find cart items with pagination and user filter
	 */
	async findWithPagination({ page = 1, limit = 10, userId, search = '' }) {
		const skip = (page - 1) * limit;
		const filter = {};

		// User filter
		if (userId) {
			filter.user_id = userId;
		}

		// Search filter (if needed for product name via populate)
		const query = this.model
			.find(filter)
			.populate('user_id', 'name email')
			.populate('product_id', 'name price imageUrl')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Apply search filter if provided
		if (search) {
			query.populate({
				path: 'product_id',
				select: 'name price imageUrl',
				match: { name: { $regex: search, $options: 'i' } },
			});
		}

		const [cartItems, totalItems] = await Promise.all([
			query,
			this.model.countDocuments(filter),
		]);

		// Filter out items where product_id is null (due to search filter)
		const filteredItems = search
			? cartItems.filter((item) => item.product_id !== null)
			: cartItems;

		const pagination = getPaginationMeta(page, limit, totalItems);

		return {
			cartItems: filteredItems,
			...pagination,
		};
	}

	/**
	 * Find cart items by user ID
	 */
	async findByUserId(userId, populate = true) {
		const query = this.model.find({ user_id: userId }).sort({ createdAt: -1 });

		if (populate) {
			query
				.populate('product_id', 'name price imageUrl stock discount')
				.populate('user_id', 'name email');
		}

		return await query.lean();
	}

	/**
	 * Find cart item by user and product
	 */
	async findByUserAndProduct(userId, productId) {
		return await this.model
			.findOne({
				user_id: userId,
				product_id: productId,
			})
			.populate('product_id', 'name price imageUrl stock')
			.lean();
	}

	/**
	 * Update cart item quantity
	 */
	async updateQuantity(userId, productId, quantity) {
		return await this.model
			.findOneAndUpdate(
				{ user_id: userId, product_id: productId },
				{ quantity },
				{ new: true, runValidators: true }
			)
			.populate('product_id', 'name price imageUrl stock')
			.lean();
	}

	/**
	 * Remove cart item by user and product
	 */
	async removeByUserAndProduct(userId, productId) {
		return await this.model.findOneAndDelete({
			user_id: userId,
			product_id: productId,
		});
	}

	/**
	 * Clear all cart items for a user
	 */
	async clearUserCart(userId) {
		return await this.model.deleteMany({ user_id: userId });
	}

	/**
	 * Bulk remove cart items
	 */
	async bulkRemove(userId, productIds) {
		return await this.model.deleteMany({
			user_id: userId,
			product_id: { $in: productIds },
		});
	}

	/**
	 * Get cart statistics
	 */
	async getCartStats() {
		const [totalCartItems, totalUsers, cartsByUser] = await Promise.all([
			this.model.countDocuments(),
			this.model.distinct('user_id').then((users) => users.length),
			this.model.aggregate([
				{
					$group: {
						_id: '$user_id',
						itemCount: { $sum: 1 },
						totalQuantity: { $sum: '$quantity' },
					},
				},
				{
					$group: {
						_id: null,
						avgItemsPerUser: { $avg: '$itemCount' },
						avgQuantityPerUser: { $avg: '$totalQuantity' },
						maxItemsPerUser: { $max: '$itemCount' },
					},
				},
			]),
		]);

		return {
			totalCartItems,
			totalUsers,
			avgItemsPerUser: cartsByUser[0]?.avgItemsPerUser || 0,
			avgQuantityPerUser: cartsByUser[0]?.avgQuantityPerUser || 0,
			maxItemsPerUser: cartsByUser[0]?.maxItemsPerUser || 0,
		};
	}

	/**
	 * Get cart total value for user
	 */
	async getCartTotal(userId) {
		const result = await this.model.aggregate([
			{ $match: { user_id: userId } },
			{
				$lookup: {
					from: 'products',
					localField: 'product_id',
					foreignField: '_id',
					as: 'product',
				},
			},
			{ $unwind: '$product' },
			{
				$addFields: {
					itemTotal: {
						$multiply: [
							'$quantity',
							{
								$subtract: [
									'$product.price',
									{ $ifNull: ['$product.discount', 0] },
								],
							},
						],
					},
				},
			},
			{
				$group: {
					_id: null,
					totalValue: { $sum: '$itemTotal' },
					totalItems: { $sum: 1 },
					totalQuantity: { $sum: '$quantity' },
				},
			},
		]);

		return result[0] || { totalValue: 0, totalItems: 0, totalQuantity: 0 };
	}

	/**
	 * Check if product exists in user's cart
	 */
	async existsInCart(userId, productId) {
		const count = await this.model.countDocuments({
			user_id: userId,
			product_id: productId,
		});
		return count > 0;
	}

	/**
	 * Get abandoned carts (carts not updated for specified days)
	 */
	async findAbandonedCarts(days = 7) {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		return await this.model
			.find({
				updatedAt: { $lt: cutoffDate },
			})
			.populate('user_id', 'name email')
			.populate('product_id', 'name price imageUrl')
			.lean();
	}
}

export default new CartRepository();
