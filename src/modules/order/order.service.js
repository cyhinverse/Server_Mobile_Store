import orderRepository from './order.repository.js';

class OrderService {
	constructor() {
		if (OrderService.instance) return OrderService.instance;
		this.orderRepo = orderRepository;
		OrderService.instance = this;
	}

	// Create new order
	async createOrder(orderData) {
		if (!orderData) {
			throw new Error('Order data is required');
		}

		const { userId, products, totalPrice, paymentMethod = 'cod', note = '', paymentId } = orderData;

		if (!userId || !products || !Array.isArray(products) || products.length === 0) {
			throw new Error('User ID and products are required');
		}

		if (!totalPrice || totalPrice <= 0) {
			throw new Error('Valid total price is required');
		}

		const processedData = {
			user_id: userId,
			payment_id: paymentId,
			products: products.map(product => ({
				variant_id: product.variantId,
				name: product.name,
				image: product.image,
				color: product.color || '',
				storage: product.storage || '',
				quantity: product.quantity,
				price: {
					originalPrice: product.originalPrice,
					discountedPrice: product.discountedPrice || product.originalPrice,
					discountCode: product.discountCode || ''
				}
			})),
			totalPrice,
			status: 'pending',
			note,
			payment_method: paymentMethod,
			createdAt: new Date()
		};

		const result = await this.orderRepo.create(processedData);
		if (!result.success) {
			throw new Error(result.error || 'Failed to create order');
		}

		return result.data;
	}

	// Get order by ID
	async getOrderById(orderId) {
		if (!orderId) {
			throw new Error('Order ID is required');
		}

		const result = await this.orderRepo.findById(orderId);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get order');
		}

		if (!result.data) {
			throw new Error('Order not found');
		}

		return result.data;
	}

	// Get orders by user ID
	async getOrdersByUserId(userId, options = {}) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		const result = await this.orderRepo.getOrdersByUserId(userId, options);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get user orders');
		}

		return result;
	}

	// Get all orders with filters
	async getAllOrders(filters = {}, options = {}) {
		const result = await this.orderRepo.getAllOrdersWithFilters(filters, options);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get orders');
		}

		return result;
	}

	// Get orders by status
	async getOrdersByStatus(status, options = {}) {
		if (!status) {
			throw new Error('Status is required');
		}

		const validStatuses = ['pending', 'completed', 'cancelled'];
		if (!validStatuses.includes(status)) {
			throw new Error('Invalid status. Must be: pending, completed, or cancelled');
		}

		const result = await this.orderRepo.getOrdersByStatus(status, options);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get orders by status');
		}

		return result;
	}

	// Update order status
	async updateOrderStatus(orderId, status) {
		if (!orderId || !status) {
			throw new Error('Order ID and status are required');
		}

		const validStatuses = ['pending', 'completed', 'cancelled'];
		if (!validStatuses.includes(status)) {
			throw new Error('Invalid status. Must be: pending, completed, or cancelled');
		}

		const result = await this.orderRepo.updateOrderStatus(orderId, status);
		if (!result.success) {
			throw new Error(result.error || 'Failed to update order status');
		}

		return result.data;
	}

	// Update order note
	async updateOrderNote(orderId, note) {
		if (!orderId) {
			throw new Error('Order ID is required');
		}

		const result = await this.orderRepo.updateOrderNote(orderId, note || '');
		if (!result.success) {
			throw new Error(result.error || 'Failed to update order note');
		}

		return result.data;
	}

	// Update payment method
	async updatePaymentMethod(orderId, paymentMethod) {
		if (!orderId || !paymentMethod) {
			throw new Error('Order ID and payment method are required');
		}

		const validMethods = ['cod', 'banking', 'vnpay'];
		if (!validMethods.includes(paymentMethod)) {
			throw new Error('Invalid payment method. Must be: cod, banking, or vnpay');
		}

		const result = await this.orderRepo.updatePaymentMethod(orderId, paymentMethod);
		if (!result.success) {
			throw new Error(result.error || 'Failed to update payment method');
		}

		return result.data;
	}

	// Cancel order
	async cancelOrder(orderId) {
		if (!orderId) {
			throw new Error('Order ID is required');
		}

		// Check if order exists and is cancellable
		const order = await this.getOrderById(orderId);
		if (order.status === 'completed') {
			throw new Error('Cannot cancel completed order');
		}

		if (order.status === 'cancelled') {
			throw new Error('Order is already cancelled');
		}

		const result = await this.orderRepo.cancelOrder(orderId);
		if (!result.success) {
			throw new Error(result.error || 'Failed to cancel order');
		}

		return result.data;
	}

	// Delete order (hard delete)
	async deleteOrder(orderId) {
		if (!orderId) {
			throw new Error('Order ID is required');
		}

		const result = await this.orderRepo.delete(orderId);
		if (!result.success) {
			throw new Error(result.error || 'Failed to delete order');
		}

		return result.data;
	}

	// Get order statistics
	async getOrderStats() {
		return await this.orderRepo.getOrderStats();
	}

	// Get orders by date range
	async getOrdersByDateRange(startDate, endDate, options = {}) {
		if (!startDate || !endDate) {
			throw new Error('Start date and end date are required');
		}

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			throw new Error('Invalid date format');
		}

		if (start > end) {
			throw new Error('Start date must be before end date');
		}

		const result = await this.orderRepo.getOrdersByDateRange(startDate, endDate, options);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get orders by date range');
		}

		return result;
	}

	// Update entire order
	async updateOrder(orderId, updateData) {
		if (!orderId) {
			throw new Error('Order ID is required');
		}

		if (!updateData || Object.keys(updateData).length === 0) {
			throw new Error('Update data is required');
		}

		// Add updatedAt timestamp
		updateData.updatedAt = new Date();

		const result = await this.orderRepo.update(orderId, updateData);
		if (!result.success) {
			throw new Error(result.error || 'Failed to update order');
		}

		return result.data;
	}
}

export default new OrderService();
