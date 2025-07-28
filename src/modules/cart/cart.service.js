import { catchAsync } from '../../configs/catchAsync.js';
import BaseService from '../../core/service/base.service.js';
import cartRepository from './cart.repository.js';

class CartService extends BaseService {
	constructor() {
		super(cartRepository);
		this.cartRepo = cartRepository;
	}

	/**
	 * Add item to cart or update quantity if exists
	 */
	addToCart = catchAsync(async (userId, productId, quantity) => {
		if (!userId || !productId || !quantity) {
			throw new Error('User ID, Product ID and quantity are required');
		}

		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		// Check if item already exists in cart
		const existingItem = await this.cartRepo.findByUserAndProduct(
			userId,
			productId
		);

		if (existingItem) {
			// Update quantity
			const newQuantity = existingItem.quantity + quantity;
			return await this.cartRepo.updateQuantity(userId, productId, newQuantity);
		} else {
			// Create new cart item
			return await this.cartRepo.create({
				user_id: userId,
				product_id: productId,
				quantity,
			});
		}
	});

	/**
	 * Get cart items for user
	 */
	getCartByUserId = catchAsync(async (userId) => {
		if (!userId) {
			throw new Error('User ID is required');
		}

		return await this.cartRepo.findByUserId(userId);
	});

	/**
	 * Get cart items with pagination
	 */
	getCartsPaginated = catchAsync(async ({ page, limit, userId, search }) => {
		return await this.cartRepo.findWithPagination({
			page,
			limit,
			userId,
			search,
		});
	});

	/**
	 * Update cart item quantity
	 */
	updateCartQuantity = catchAsync(async (userId, productId, quantity) => {
		if (!userId || !productId || quantity === undefined) {
			throw new Error('User ID, Product ID and quantity are required');
		}

		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		const existingItem = await this.cartRepo.findByUserAndProduct(
			userId,
			productId
		);
		if (!existingItem) {
			throw new Error('Cart item not found');
		}

		return await this.cartRepo.updateQuantity(userId, productId, quantity);
	});

	/**
	 * Remove item from cart
	 */
	removeFromCart = catchAsync(async (userId, productId) => {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		const existingItem = await this.cartRepo.findByUserAndProduct(
			userId,
			productId
		);
		if (!existingItem) {
			throw new Error('Cart item not found');
		}

		return await this.cartRepo.removeByUserAndProduct(userId, productId);
	});

	/**
	 * Clear all cart items for user
	 */
	clearCart = catchAsync(async (userId) => {
		if (!userId) {
			throw new Error('User ID is required');
		}

		const result = await this.cartRepo.clearUserCart(userId);
		if (result.deletedCount === 0) {
			throw new Error('No cart items found for the user');
		}

		return result;
	});

	/**
	 * Bulk remove items from cart
	 */
	bulkRemoveFromCart = catchAsync(async (userId, productIds) => {
		if (
			!userId ||
			!productIds ||
			!Array.isArray(productIds) ||
			productIds.length === 0
		) {
			throw new Error('User ID and Product IDs are required');
		}

		return await this.cartRepo.bulkRemove(userId, productIds);
	});

	/**
	 * Get cart total for user
	 */
	getCartTotal = catchAsync(async (userId) => {
		if (!userId) {
			throw new Error('User ID is required');
		}

		return await this.cartRepo.getCartTotal(userId);
	});

	/**
	 * Check if product exists in cart
	 */
	checkProductInCart = catchAsync(async (userId, productId) => {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		return await this.cartRepo.existsInCart(userId, productId);
	});

	/**
	 * Get cart statistics
	 */
	getCartStats = catchAsync(async () => {
		return await this.cartRepo.getCartStats();
	});

	/**
	 * Get abandoned carts
	 */
	getAbandonedCarts = catchAsync(async (days = 7) => {
		if (days <= 0) {
			throw new Error('Days must be greater than 0');
		}

		return await this.cartRepo.findAbandonedCarts(days);
	});

	/**
	 * Decrease quantity from cart (for partial removal)
	 */
	decreaseQuantity = catchAsync(async (userId, productId, decreaseBy) => {
		if (!userId || !productId || !decreaseBy) {
			throw new Error('User ID, Product ID and decrease amount are required');
		}

		if (decreaseBy <= 0) {
			throw new Error('Decrease amount must be greater than 0');
		}

		const existingItem = await this.cartRepo.findByUserAndProduct(
			userId,
			productId
		);
		if (!existingItem) {
			throw new Error('Cart item not found');
		}

		const newQuantity = existingItem.quantity - decreaseBy;

		if (newQuantity <= 0) {
			// Remove item if quantity becomes 0 or negative
			return await this.cartRepo.removeByUserAndProduct(userId, productId);
		} else {
			// Update with new quantity
			return await this.cartRepo.updateQuantity(userId, productId, newQuantity);
		}
	});
}

export default new CartService();
