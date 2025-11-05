import BaseService from '../../core/service/base.service.js';
import cartRepository from './cart.repository.js';

class CartService extends BaseService {
	constructor() {
		super(cartRepository);
		this.cartRepo = cartRepository;
	}

	/**
	 * Add item to cart or update quantity if exists
	 * @param {string} userId - User ID
	 * @param {Object} cartData - Cart data including productId, quantity, and optional variant info
	 * @param {string} cartData.productId - Product ID
	 * @param {number} cartData.quantity - Quantity to add
	 * @param {string} [cartData.variantId] - Optional variant ID
	 * @param {string} [cartData.variantSku] - Optional variant SKU
	 * @param {number} [cartData.price] - Optional price of the variant
	 */
	async addToCart(userId, cartData) {
		const {
			productId,
			quantity,
			variantId,
			variantSku,
			price,
			variantColor,
			variantStorage,
		} = cartData;

		if (!userId || !productId || !quantity) {
			throw new Error('User ID, Product ID and quantity are required');
		}

		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		// Find or create cart for user
		let cart = await this.cartRepo.model.findOne({ user_id: userId });

		if (!cart) {
			// Create new cart with first product
			cart = await this.cartRepo.model.create({
				user_id: userId,
				products: [
					{
						product_id: productId,
						quantity,
						...(variantId && { variant_id: variantId }),
						...(variantSku && { variant_sku: variantSku }),
						...(price && { price }),
						...(variantColor && { variant_color: variantColor }),
						...(variantStorage && { variant_storage: variantStorage }),
					},
				],
			});
			return cart;
		} // Check if product with same variant already exists in cart
		const existingProductIndex = cart.products.findIndex((item) => {
			const sameProduct = item.product_id.toString() === productId;
			const sameVariant = variantSku
				? item.variant_sku === variantSku
				: !item.variant_sku;
			return sameProduct && sameVariant;
		});

		if (existingProductIndex > -1) {
			// Update quantity of existing product
			cart.products[existingProductIndex].quantity += quantity;
		} else {
			// Add new product to cart
			cart.products.push({
				product_id: productId,
				quantity,
				...(variantId && { variant_id: variantId }),
				...(variantSku && { variant_sku: variantSku }),
				...(price && { price }),
				...(variantColor && { variant_color: variantColor }),
				...(variantStorage && { variant_storage: variantStorage }),
			});
		}

		// Save cart
		await cart.save();

		// Populate and return
		const populatedCart = await this.cartRepo.model
			.findById(cart._id)
			.populate('products.product_id', 'name price thumbnail stock')
			.lean();

		return populatedCart;
	}

	/**
	 * Get cart items for user
	 */
	async getCartByUserId(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		return await this.cartRepo.findByUserId(userId);
	}

	/**
	 * Get cart items with pagination
	 */
	async getCartsPaginated({ page, limit, userId, search }) {
		return await this.cartRepo.findWithPagination({
			page,
			limit,
			userId,
			search,
		});
	}

	/**
	 * Update cart item quantity
	 */
	async updateCartQuantity(userId, productId, quantity, variantSku = null) {
		if (!userId || !productId || quantity === undefined) {
			throw new Error('User ID, Product ID and quantity are required');
		}

		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		// Find cart and check if product exists
		const cart = await this.cartRepo.model.findOne({ user_id: userId }).lean();

		if (!cart) {
			throw new Error('Cart not found');
		}

		// Find product in products array (with optional variant matching)
		const productIndex = cart.products.findIndex((item) => {
			const matchProduct = item.product_id.toString() === productId;
			const matchVariant = variantSku ? item.variant_sku === variantSku : true;
			return matchProduct && matchVariant;
		});

		if (productIndex === -1) {
			throw new Error('Cart item not found');
		}

		// Update quantity
		return await this.cartRepo.updateQuantity(
			userId,
			productId,
			quantity,
			variantSku
		);
	}

	/**
	 * Remove item from cart
	 */
	async removeFromCart(userId, productId, variantSku = null) {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		// Find cart
		const cart = await this.cartRepo.model.findOne({ user_id: userId }).lean();

		if (!cart) {
			throw new Error('Cart not found');
		}

		// Find product in products array (with optional variant matching)
		const productExists = cart.products.some((item) => {
			const matchProduct = item.product_id.toString() === productId;
			const matchVariant = variantSku ? item.variant_sku === variantSku : true;
			return matchProduct && matchVariant;
		});

		if (!productExists) {
			throw new Error('Cart item not found');
		}

		// Remove from products array
		return await this.cartRepo.removeByUserAndProduct(
			userId,
			productId,
			variantSku
		);
	}

	/**
	 * Clear all cart items for user
	 */
	async clearCart(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		const result = await this.cartRepo.clearUserCart(userId);
		if (result.deletedCount === 0) {
			throw new Error('No cart items found for the user');
		}

		return result;
	}

	/**
	 * Bulk remove items from cart
	 */
	async bulkRemoveFromCart(userId, productIds) {
		if (
			!userId ||
			!productIds ||
			!Array.isArray(productIds) ||
			productIds.length === 0
		) {
			throw new Error('User ID and Product IDs are required');
		}

		return await this.cartRepo.bulkRemove(userId, productIds);
	}

	/**
	 * Get cart total for user
	 */
	async getCartTotal(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		return await this.cartRepo.getCartTotal(userId);
	}

	/**
	 * Check if product exists in cart
	 */
	async checkProductInCart(userId, productId) {
		if (!userId || !productId) {
			throw new Error('User ID and Product ID are required');
		}

		return await this.cartRepo.existsInCart(userId, productId);
	}

	/**
	 * Get cart statistics
	 */
	async getCartStats() {
		return await this.cartRepo.getCartStats();
	}

	/**
	 * Get abandoned carts
	 */
	async getAbandonedCarts(days = 7) {
		if (days <= 0) {
			throw new Error('Days must be greater than 0');
		}

		return await this.cartRepo.findAbandonedCarts(days);
	}

	/**
	 * Decrease quantity from cart (for partial removal)
	 */
	async decreaseQuantity(userId, productId, decreaseBy) {
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
	}
}

export default new CartService();
