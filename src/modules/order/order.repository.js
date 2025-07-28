import BaseRepository from '../../core/repository/base.repository.js';
import Order from './order.model.js';

class OrderRepository extends BaseRepository {
	constructor() {
		super(Order);
	}

	// Get orders by user ID with pagination
	async getOrdersByUserId(userId, options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 }, status } = options;
		const skip = (page - 1) * limit;

		try {
			const query = { user_id: userId };
			if (status) {
				query.status = status;
			}

			const orders = await this.model
				.find(query)
				.populate('user_id', 'name email phone')
				.populate('payment_id', 'method status amount')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments(query);

			return {
				success: true,
				data: orders,
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

	// Get orders by status with pagination
	async getOrdersByStatus(status, options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		try {
			const orders = await this.model
				.find({ status })
				.populate('user_id', 'name email phone')
				.populate('payment_id', 'method status amount')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments({ status });

			return {
				success: true,
				data: orders,
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

	// Get all orders with filters and pagination
	async getAllOrdersWithFilters(filters = {}, options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		try {
			const query = {};

			if (filters.status) {
				query.status = filters.status;
			}

			if (filters.userId) {
				query.user_id = filters.userId;
			}

			if (filters.paymentMethod) {
				query.payment_method = filters.paymentMethod;
			}

			if (filters.dateFrom && filters.dateTo) {
				query.createdAt = {
					$gte: new Date(filters.dateFrom),
					$lte: new Date(filters.dateTo),
				};
			}

			if (filters.minTotal) {
				query.totalPrice = { $gte: filters.minTotal };
			}

			if (filters.maxTotal) {
				query.totalPrice = { ...query.totalPrice, $lte: filters.maxTotal };
			}

			const orders = await this.model
				.find(query)
				.populate('user_id', 'name email phone')
				.populate('payment_id', 'method status amount')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments(query);

			return {
				success: true,
				data: orders,
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

	// Update order status
	async updateOrderStatus(orderId, status) {
		try {
			const order = await this.model
				.findByIdAndUpdate(
					orderId,
					{
						status,
						updatedAt: new Date(),
					},
					{ new: true }
				)
				.populate('user_id', 'name email phone');

			if (!order) {
				return {
					success: false,
					error: 'Order not found',
				};
			}

			return {
				success: true,
				data: order,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Update order note
	async updateOrderNote(orderId, note) {
		try {
			const order = await this.model
				.findByIdAndUpdate(
					orderId,
					{
						note,
						updatedAt: new Date(),
					},
					{ new: true }
				)
				.populate('user_id', 'name email phone');

			if (!order) {
				return {
					success: false,
					error: 'Order not found',
				};
			}

			return {
				success: true,
				data: order,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Update payment method
	async updatePaymentMethod(orderId, paymentMethod) {
		try {
			const order = await this.model
				.findByIdAndUpdate(
					orderId,
					{
						payment_method: paymentMethod,
						updatedAt: new Date(),
					},
					{ new: true }
				)
				.populate('user_id', 'name email phone');

			if (!order) {
				return {
					success: false,
					error: 'Order not found',
				};
			}

			return {
				success: true,
				data: order,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Get order statistics
	async getOrderStats() {
		try {
			const stats = await this.model.aggregate([
				{
					$group: {
						_id: null,
						totalOrders: { $sum: 1 },
						totalRevenue: { $sum: '$totalPrice' },
						averageOrderValue: { $avg: '$totalPrice' },
						statusDistribution: {
							$push: '$status',
						},
						paymentMethodDistribution: {
							$push: '$payment_method',
						},
					},
				},
			]);

			if (stats.length === 0) {
				return {
					totalOrders: 0,
					totalRevenue: 0,
					averageOrderValue: 0,
					statusDistribution: { pending: 0, completed: 0, cancelled: 0 },
					paymentMethodDistribution: { cod: 0, banking: 0, vnpay: 0 },
				};
			}

			const result = stats[0];

			// Count status distribution
			const statusCount = { pending: 0, completed: 0, cancelled: 0 };
			result.statusDistribution.forEach((status) => {
				statusCount[status] = (statusCount[status] || 0) + 1;
			});

			// Count payment method distribution
			const paymentCount = { cod: 0, banking: 0, vnpay: 0 };
			result.paymentMethodDistribution.forEach((method) => {
				paymentCount[method] = (paymentCount[method] || 0) + 1;
			});

			return {
				totalOrders: result.totalOrders,
				totalRevenue: Math.round(result.totalRevenue * 100) / 100,
				averageOrderValue: Math.round(result.averageOrderValue * 100) / 100,
				statusDistribution: statusCount,
				paymentMethodDistribution: paymentCount,
			};
		} catch (error) {
			throw new Error(`Error getting order stats: ${error.message}`);
		}
	}

	// Get orders by date range
	async getOrdersByDateRange(startDate, endDate, options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		try {
			const query = {
				createdAt: {
					$gte: new Date(startDate),
					$lte: new Date(endDate),
				},
			};

			const orders = await this.model
				.find(query)
				.populate('user_id', 'name email phone')
				.populate('payment_id', 'method status amount')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments(query);

			return {
				success: true,
				data: orders,
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

	// Cancel order (soft delete by updating status)
	async cancelOrder(orderId) {
		try {
			const order = await this.model
				.findByIdAndUpdate(
					orderId,
					{
						status: 'cancelled',
						updatedAt: new Date(),
					},
					{ new: true }
				)
				.populate('user_id', 'name email phone');

			if (!order) {
				return {
					success: false,
					error: 'Order not found',
				};
			}

			return {
				success: true,
				data: order,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}
}

export default new OrderRepository();
