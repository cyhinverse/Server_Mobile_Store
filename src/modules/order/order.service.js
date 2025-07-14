import Order from './order.model.js';
import UserService from '../user/user.service.js';
import ProductService from '../product/product.service.js';
class OrderService {
	constructor(userService, productService) {
		if (!OrderService.instance) return OrderService.instance;
		this.Order = Order;
		this.userService = UserService;
		this.productService = ProductService;
		OrderService.instance = this;
	}

	async createOrder(userId, productId, quantity, price, note, payment_method) {
		if (!userId || !productId || !quantity) {
			throw new Error('Missing required fields');
		}
		const checkUserExists = await this.userService.checkUserExists(userId);
		if (!checkUserExists) {
			throw new Error('User does not exist');
		}
		const checkStock = await this.productService.checkStock(
			productId,
			quantity
		);
		if (!checkStock) {
			throw new Error('Insufficient stock for the product');
		}
		const order = new this.Order({
			user_id: userId,
			products: [
				{
					product_id: productId,
					quantity: quantity,
					price: price,
				},
			],
			totalPrice: price * quantity,
			status: 'pending',
			note: note || '',
			payment_method: payment_method || 'cod',
		});
		if (!order) {
			throw new Error('Failed to create order');
		}
		await this.productService.deductStock(productId, quantity);
	}
}

export default new OrderService();
