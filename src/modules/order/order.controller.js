import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import OrderService from './order.service.js';
import { OrderValidation } from './order.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class OrderController {
	constructor() {
		if (OrderController.instance) return OrderController.instance;
		OrderController.instance = this;
	}

	// Create new order
	createOrder = catchAsync(async (req, res) => {
		const { error, value } = OrderValidation.createOrder.validate(req.body, {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: true,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			value.userId = req.user.id;
			const order = await OrderService.createOrder(value);
			return formatSuccess({
				res,
				message: 'Order created successfully',
				code: StatusCodes.CREATED,
				data: order,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get order by ID
	getOrderById = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail({
				res,
				message: 'Order ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const order = await OrderService.getOrderById(id);
			return formatSuccess({
				res,
				message: 'Order retrieved successfully',
				code: StatusCodes.OK,
				data: order,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get orders by user ID (current user)
	getMyOrders = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const { page = 1, limit = 10, status } = req.query;
			
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
				status
			};

			const result = await OrderService.getOrdersByUserId(userId, options);
			return formatSuccess(
				res,
				'User orders retrieved successfully',
				StatusCodes.OK,
				result
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Get orders by user ID (for admin)
	getOrdersByUserId = catchAsync(async (req, res) => {
		const { userId } = req.params;
		const { page = 1, limit = 10, status } = req.query;

		if (!userId) {
			return formatFail({
				res,
				message: 'User ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
				status,
			};

			const result = await OrderService.getOrdersByUserId(userId, options);
			return formatSuccess({
				res,
				message: 'User orders retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get all orders with filters
	getAllOrders = catchAsync(async (req, res) => {
		try {
			const { 
				page = 1, 
				limit = 10, 
				status, 
				paymentMethod, 
				dateFrom, 
				dateTo,
				minTotal,
				maxTotal
			} = req.query;

			const filters = {};
			if (status) filters.status = status;
			if (paymentMethod) filters.paymentMethod = paymentMethod;
			if (dateFrom) filters.dateFrom = dateFrom;
			if (dateTo) filters.dateTo = dateTo;
			if (minTotal) filters.minTotal = parseFloat(minTotal);
			if (maxTotal) filters.maxTotal = parseFloat(maxTotal);

			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await OrderService.getAllOrders(filters, options);
			return formatSuccess({
				res,
				message: 'Orders retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get orders by status
	getOrdersByStatus = catchAsync(async (req, res) => {
		const { status } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!status) {
			return formatFail({
				res,
				message: 'Status is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await OrderService.getOrdersByStatus(status, options);
			return formatSuccess({
				res,
				message: 'Orders by status retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			if (error.message.includes('Invalid status')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.BAD_REQUEST,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Update order status
	updateOrderStatus = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { error, value } = OrderValidation.updateStatus.validate(req.body, {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: true,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			const order = await OrderService.updateOrderStatus(id, value.status);
			return formatSuccess({
				res,
				message: 'Order status updated successfully',
				code: StatusCodes.OK,
				data: order,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			if (error.message.includes('Invalid status')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.BAD_REQUEST,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Update order note
	updateOrderNote = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { error, value } = OrderValidation.updateNote.validate(req.body, {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: true,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			const order = await OrderService.updateOrderNote(id, value.note);
			return formatSuccess({
				res,
				message: 'Order note updated successfully',
				code: StatusCodes.OK,
				data: order,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Update payment method
	updatePaymentMethod = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { error, value } = OrderValidation.updatePaymentMethod.validate(req.body, {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: true,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			const order = await OrderService.updatePaymentMethod(
				id,
				value.paymentMethod
			);
			return formatSuccess({
				res,
				message: 'Payment method updated successfully',
				code: StatusCodes.OK,
				data: order,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			if (error.message.includes('Invalid payment method')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.BAD_REQUEST,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Cancel order
	cancelOrder = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail({
				res,
				message: 'Order ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const order = await OrderService.cancelOrder(id);
			return formatSuccess({
				res,
				message: 'Order cancelled successfully',
				code: StatusCodes.OK,
				data: order,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			if (
				error.message.includes('Cannot cancel') ||
				error.message.includes('already cancelled')
			) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.BAD_REQUEST,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Delete order
	deleteOrder = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail({
				res,
				message: 'Order ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			await OrderService.deleteOrder(id);
			return formatSuccess({
				res,
				message: 'Order deleted successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get order statistics
	getOrderStats = catchAsync(async (req, res) => {
		try {
			const stats = await OrderService.getOrderStats();
			return formatSuccess({
				res,
				message: 'Order statistics retrieved successfully',
				code: StatusCodes.OK,
				data: stats,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get orders by date range
	getOrdersByDateRange = catchAsync(async (req, res) => {
		const { error, value } = OrderValidation.dateRange.validate(req.query, {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: true,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			const { startDate, endDate, page = 1, limit = 10 } = value;
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await OrderService.getOrdersByDateRange(
				startDate,
				endDate,
				options
			);
			return formatSuccess({
				res,
				message: 'Orders by date range retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			if (
				error.message.includes('Invalid date') ||
				error.message.includes('before end date')
			) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.BAD_REQUEST,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
}

export default new OrderController();
