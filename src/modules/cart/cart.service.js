import cart from '../cart.model.js';
import { catchAsync } from '../../configs/catchAsync.js';

class CartService {
	constructor() {
		if (CartService.instance) return CartService.instance;
		this.model = cart;
		CartService.instance = this;
	}
	createCart = catchAsync(async (userId, productId, quantity) => {
		if (!userId || !productId || !quantity) {
			throw new Error('User ID and Product ID are required');
		}
		const _cart = new this.model({
			user_id: userId,
			product_id: productId,
			quantity: quantity,
		});
		return await _cart.save();
	});
	deleteCart = catchAsync(async (userId, prodictId) => {
		if (!userId || !prodictId) {
			throw new Error('User ID and Product ID are required');
		}
		const cartItem = await this.model.findOneAndDelete({
			user_id: userId,
			product_id: prodictId,
		});
		if (!cartItem) {
			throw new Error('Cart item not found');
		}
		return cartItem;
	});
	getCartByUserId = catchAsync(async (userId) => {
		if (!userId || userId === undefined) {
			throw new Error('User ID is required');
		}
		const cartItems = await this.model
			.find({ user_id: userId })
			.populate('product_id', 'name price thunbnail isFeatured isNew');
	});
	updateCart = catchAsync(async (userId, productId, quantity) => {
		if (!userId || !productId || !quantity) {
			throw new Error('User ID, Product ID and Quantity are required');
		}
		const updatedCart = await this.model.findOneAndUpdate(
			{ user_id: userId, product_id: productId },
			{ quantity: quantity },
			{ new: true }
		);
		if (!updatedCart) {
			throw new Error('Cart item not found');
		}
		return updatedCart;
	});
	async clearCartByUserId(userId) {
		if (!userId || userId === undefined) {
			throw new Error('User ID is required');
		}
		const result = await this.model.deleteMany({ user_id: userId });
		if (result.deletedCount === 0) {
			throw new Error('No cart items found for the user');
		}
		return result;
	}
}

export default new CartService();
