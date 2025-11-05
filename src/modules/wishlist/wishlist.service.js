import wishlistRepository from './wishlist.repository.js';

class WishlistService {
	constructor() {
		if (WishlistService.instance) return WishlistService.instance;
		this.wishlistRepo = wishlistRepository;
		WishlistService.instance = this;
	}

	// Add product to wishlist (or create wishlist if doesn't exist)
	async addToWishlist(userId, productId) {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		const result = await this.wishlistRepo.addProductToWishlist(
			userId,
			productId
		);
		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data;
	}

	// Remove product from wishlist
	async removeFromWishlist(userId, productId) {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		const result = await this.wishlistRepo.removeProductFromWishlist(
			userId,
			productId
		);
		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data;
	}

	// Get user's wishlist
	async getUserWishlist(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		const result = await this.wishlistRepo.getWishlistByUserId(userId);
		if (!result.success) {
			throw new Error(result.error);
		}

		// Return empty wishlist if user doesn't have one
		if (!result.data) {
			return {
				user_id: userId,
				products: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};
		}

		return result.data;
	}

	// Clear all products from wishlist
	async clearWishlist(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		const result = await this.wishlistRepo.clearWishlist(userId);
		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data;
	}

	// Check if product is in wishlist
	async isProductInWishlist(userId, productId) {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		return await this.wishlistRepo.isProductInWishlist(userId, productId);
	}

	// Get wishlist count
	async getWishlistCount(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		const result = await this.wishlistRepo.getWishlistCount(userId);
		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data;
	}

	// Toggle product in wishlist (add if not exists, remove if exists)
	async toggleProductInWishlist(userId, productId) {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		const isInWishlist = await this.isProductInWishlist(userId, productId);

		let result;
		let action;

		if (isInWishlist) {
			result = await this.removeFromWishlist(userId, productId);
			action = 'removed';
		} else {
			result = await this.addToWishlist(userId, productId);
			action = 'added';
		}

		// Return format expected by frontend
		return {
			...result,
			action,
			productId,
			wishlistItem:
				action === 'added'
					? result.products?.find((p) => p.product_id.toString() === productId)
					: null,
		};
	}

	// Get all wishlists (for admin)
	async getAllWishlists(options = {}) {
		const result = await this.wishlistRepo.getAllWishlists(options);
		if (!result.success) {
			throw new Error(result.error);
		}

		return result;
	}
}

export default new WishlistService();
