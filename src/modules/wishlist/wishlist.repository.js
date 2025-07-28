import BaseRepository from '../../core/repository/base.repository.js';
import WishList from './wishlist.model.js';

class WishListRepository extends BaseRepository {
	constructor() {
		super(WishList);
	}

	// Get wishlist by user ID with populated products
	async getWishlistByUserId(userId) {
		try {
			const wishlist = await this.model
				.findOne({ user_id: userId })
				.populate({
					path: 'products.product_id',
					select:
						'name price images description category_id brand_id stock status',
					populate: [
						{ path: 'category_id', select: 'name' },
						{ path: 'brand_id', select: 'name' },
					],
				})
				.lean();

			return {
				success: true,
				data: wishlist,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Create wishlist for user
	async createWishlistForUser(userId) {
		try {
			const wishlistData = {
				user_id: userId,
				products: [],
				createdAt: new Date(),
			};

			const result = await this.create(wishlistData);
			return result;
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Add product to wishlist
	async addProductToWishlist(userId, productId) {
		try {
			// First check if wishlist exists
			let wishlist = await this.model.findOne({ user_id: userId });

			if (!wishlist) {
				// Create new wishlist if doesn't exist
				const createResult = await this.createWishlistForUser(userId);
				if (!createResult.success) {
					return createResult;
				}
				wishlist = createResult.data;
			}

			// Check if product already exists in wishlist
			const productExists = wishlist.products.some(
				(item) => item.product_id.toString() === productId
			);

			if (productExists) {
				return {
					success: false,
					error: 'Product already exists in wishlist',
				};
			}

			// Add product to wishlist
			const result = await this.model
				.findByIdAndUpdate(
					wishlist._id,
					{
						$push: { products: { product_id: productId } },
						updatedAt: new Date(),
					},
					{ new: true }
				)
				.populate({
					path: 'products.product_id',
					select: 'name price images description',
				});

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Remove product from wishlist
	async removeProductFromWishlist(userId, productId) {
		try {
			const result = await this.model
				.findOneAndUpdate(
					{ user_id: userId },
					{
						$pull: { products: { product_id: productId } },
						updatedAt: new Date(),
					},
					{ new: true }
				)
				.populate({
					path: 'products.product_id',
					select: 'name price images description',
				});

			if (!result) {
				return {
					success: false,
					error: 'Wishlist not found',
				};
			}

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Clear all products from wishlist
	async clearWishlist(userId) {
		try {
			const result = await this.model.findOneAndUpdate(
				{ user_id: userId },
				{
					$set: { products: [] },
					updatedAt: new Date(),
				},
				{ new: true }
			);

			if (!result) {
				return {
					success: false,
					error: 'Wishlist not found',
				};
			}

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Check if product is in user's wishlist
	async isProductInWishlist(userId, productId) {
		try {
			const wishlist = await this.model.findOne({
				user_id: userId,
				'products.product_id': productId,
			});

			return !!wishlist;
		} catch (error) {
			throw new Error(`Error checking wishlist: ${error.message}`);
		}
	}

	// Get wishlist count for user
	async getWishlistCount(userId) {
		try {
			const wishlist = await this.model.findOne({ user_id: userId });

			return {
				success: true,
				data: {
					count: wishlist ? wishlist.products.length : 0,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Get multiple wishlists (for admin)
	async getAllWishlists(options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		try {
			const wishlists = await this.model
				.find({})
				.populate('user_id', 'name email')
				.populate({
					path: 'products.product_id',
					select: 'name price images',
				})
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments({});

			return {
				success: true,
				data: wishlists,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}
}

export default new WishListRepository();
