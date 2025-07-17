import Order from './order.model.js';
import UserService from '../user/user.service.js';
import ProductService from '../product/product.service.js';
import VariantService from '../variant/variant.service.js';
import DiscountService from '../discount/discount.service.js';
class OrderService {
	constructor() {
		if (!OrderService.instance) return OrderService.instance;
		this.Order = Order;
		this.userService = UserService;
		this.productService = ProductService;
		OrderService.instance = this;
	}

	async createOrder(
		userId,
		variant_id,
		payment_id,
		name,
		image,
		color,
		storage,
		quantity,
		status,
		note,
		payment_method,
		discountCode
	) {
		const user = await UserService.getUserById(userId);
		if (!user) throw new Error('User not found');

		const variant = await VariantService.checkAndUpdateStock(
			variant_id,
			quantity
		);

		const originalPrice = variant.price;

		const { discountedPrice, appliedDiscountCode } =
			await DiscountService.applyDiscount({ originalPrice, discountCode });

		const totalPrice = quantity * discountedPrice;
		if (totalPrice < 0) throw new Error('Invalid total price');

		// Tạo đơn hàng
		const order = await Order.create({
			user_id: userId,
			payment_id,
			payment_method,
			note,
			status,
			products: [
				{
					variant_id,
					name,
					image,
					color,
					storage,
					quantity,
					price: {
						originalPrice,
						discountedPrice,
						discountCode: appliedDiscountCode,
					},
				},
			],
			totalPrice,
		});
		// Cập nhật tồn kho
		variant.stock -= quantity;
		await variant.save();

		return {
			order,
			user: {
				username: user.fullName,
				email: user.email,
				phone_number: user.phoneNumber,
				address: user.address,
			},
		};
	}
	async deleteOrder(orderId) {
		if (!orderId) {
			throw new Error('OrderId is require');
		}
		const deleteOrder = await this.Order.findByIdAndDelete(orderId);
		if (!deleteOrder) {
			throw new Error('Can not delete this Order');
		}
		return deleteOrder;
	}

	async updateStatus(orderId, status) {
		if (!orderId) {
			throw new Error('Order id is require!');
		}
		if (!status) {
			throw new Error('Status is require!');
		}
		const allowStatus = ['pending', 'completed', 'cancelled'];
		if (!allowStatus.includes(status)) {
			throw new Error('Invalid status');
		}

		const updateStatus = await this.Order.findByIdAndUpdate(
			orderId,
			{ status },
			{ new: true }
		);

		if (!updateStatus) {
			throw new Error('Updated error !');
		}

		return updateStatus;
	}

	async updateNote(userId, note) {
		if (!userId || !note) {
			throw new Error('UserId and note are required');
		}
		const order = await this.Order.findOneAndUpdate(
			{ user_id: userId },
			{ note },
			{ new: true }
		);
		if (!order) {
			throw new Error('Order not found');
		}
		return order;
	}

	async cancelOrder(orderId) {
		if (!orderId) {
			throw new Error('OrderId is required');
		}
		const order = await this.Order.findById(orderId);
		if (!order) {
			throw new Error('Order not found');
		}
		if (order.status !== 'pending') {
			throw new Error('Only pending orders can be cancelled');
		}
		order.status = 'cancelled';
		await order.save();
		return order;
	}

	async getOrderById(orderId) {
		if (!orderId) {
			throw new Error('OrderId is required');
		}
		const order = await this.Order.findById(orderId);
		if (!order) {
			throw new Error('Order not found');
		}
		return order;
	}
	async getOrderByUserId(userId) {
		if (!userId) {
			throw new Error('UserId is required');
		}
		const orders = await this.Order.find({ user_id: userId });
		if (!orders || orders.length === 0) {
			throw new Error('No orders found for this user');
		}
		return orders;
	}
	async getAllOrders() {
		const orders = await this.Order.find();
		if (!orders || orders.length === 0) {
			throw new Error('No orders found');
		}
		return orders;
	}
}

export default new OrderService();
