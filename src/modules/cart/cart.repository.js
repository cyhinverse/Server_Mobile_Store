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
	 * Find cart by user ID (returns single cart document with products array)
	 */
	async findByUserId(userId, populate = true) {
		const query = this.model.findOne({ user_id: userId });

		if (populate) {
			query
				.populate('products.product_id', 'name price thumbnail stock')
				.populate('user_id', 'fullName email');
		}

		const cart = await query.lean();

		// If no cart exists, return empty structure
		if (!cart) {
			return {
				user_id: userId,
				products: [],
			};
		}

		return cart;
	}

	/**
	 * Find cart item by user and product (checks if product exists in products array)
	 */
	async findByUserAndProduct(userId, productId) {
		const cart = await this.model
			.findOne({
				user_id: userId,
				'products.product_id': productId,
			})
			.lean();

		if (!cart) return null;

		// Find the specific product in the products array
		const product = cart.products.find(
			(p) => p.product_id.toString() === productId
		);
		return product || null;
	}

	/**
	 * Update cart item quantity (updates quantity in products array)
	 */
	async updateQuantity(userId, productId, quantity, variantSku = null) {
		const filter = {
			user_id: userId,
			'products.product_id': productId,
		};

		// If variantSku is provided, also match it
		if (variantSku) {
			filter['products.variant_sku'] = variantSku;
		}

		const update = variantSku
			? {
					$set: {
						'products.$[elem].quantity': quantity,
					},
			  }
			: {
					$set: {
						'products.$.quantity': quantity,
					},
			  };

		const options = {
			new: true,
			runValidators: true,
			arrayFilters: variantSku
				? [{ 'elem.product_id': productId, 'elem.variant_sku': variantSku }]
				: undefined,
		};

		return await this.model
			.findOneAndUpdate(filter, update, options)
			.populate('products.product_id', 'name price thumbnail stock')
			.lean();
	}

	/**
	 * Remove cart item by user and product (removes from products array)
	 */
	async removeByUserAndProduct(userId, productId, variantSku = null) {
		const filter = { user_id: userId };

		const pullCondition = variantSku
			? { product_id: productId, variant_sku: variantSku }
			: { product_id: productId };

		return await this.model
			.findOneAndUpdate(
				filter,
				{
					$pull: {
						products: pullCondition,
					},
				},
				{ new: true }
			)
			.populate('products.product_id', 'name price thumbnail stock')
			.lean();
	}

	/**
	 * Clear all cart items for a user (clears products array)
	 */
	async clearUserCart(userId) {
		return await this.model.findOneAndUpdate(
			{ user_id: userId },
			{ $set: { products: [] } },
			{ new: true }
		);
	}

	/**
	 * Bulk remove cart items (removes multiple products from products array)
	 */
	async bulkRemove(userId, productIds) {
		return await this.model
			.findOneAndUpdate(
				{ user_id: userId },
				{
					$pull: {
						products: { product_id: { $in: productIds } },
					},
				},
				{ new: true }
			)
			.populate('products.product_id', 'name price thumbnail stock')
			.lean();
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
