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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			value.userId = req.user.id;
			const order = await OrderService.createOrder(value);
			return formatSuccess(
				res,
				'Order created successfully',
				StatusCodes.CREATED,
				order
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Get order by ID
	getOrderById = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail(
				res,
				'Order ID is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const order = await OrderService.getOrderById(id);
			return formatSuccess(
				res,
				'Order retrieved successfully',
				StatusCodes.OK,
				order
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatFail(
				res,
				'User ID is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
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
			return formatSuccess(
				res,
				'Orders retrieved successfully',
				StatusCodes.OK,
				result
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Get orders by status
	getOrdersByStatus = catchAsync(async (req, res) => {
		const { status } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!status) {
			return formatFail(
				res,
				'Status is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await OrderService.getOrdersByStatus(status, options);
			return formatSuccess(
				res,
				'Orders by status retrieved successfully',
				StatusCodes.OK,
				result
			);
		} catch (error) {
			if (error.message.includes('Invalid status')) {
				return formatFail(res, error.message, StatusCodes.BAD_REQUEST);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const order = await OrderService.updateOrderStatus(id, value.status);
			return formatSuccess(
				res,
				'Order status updated successfully',
				StatusCodes.OK,
				order
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			if (error.message.includes('Invalid status')) {
				return formatFail(res, error.message, StatusCodes.BAD_REQUEST);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const order = await OrderService.updateOrderNote(id, value.note);
			return formatSuccess(
				res,
				'Order note updated successfully',
				StatusCodes.OK,
				order
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const order = await OrderService.updatePaymentMethod(id, value.paymentMethod);
			return formatSuccess(
				res,
				'Payment method updated successfully',
				StatusCodes.OK,
				order
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			if (error.message.includes('Invalid payment method')) {
				return formatFail(res, error.message, StatusCodes.BAD_REQUEST);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Cancel order
	cancelOrder = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail(
				res,
				'Order ID is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const order = await OrderService.cancelOrder(id);
			return formatSuccess(
				res,
				'Order cancelled successfully',
				StatusCodes.OK,
				order
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			if (error.message.includes('Cannot cancel') || error.message.includes('already cancelled')) {
				return formatFail(res, error.message, StatusCodes.BAD_REQUEST);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Delete order
	deleteOrder = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail(
				res,
				'Order ID is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			await OrderService.deleteOrder(id);
			return formatSuccess(
				res,
				'Order deleted successfully',
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Get order statistics
	getOrderStats = catchAsync(async (req, res) => {
		try {
			const stats = await OrderService.getOrderStats();
			return formatSuccess(
				res,
				'Order statistics retrieved successfully',
				StatusCodes.OK,
				stats
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const { startDate, endDate, page = 1, limit = 10 } = value;
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await OrderService.getOrdersByDateRange(startDate, endDate, options);
			return formatSuccess(
				res,
				'Orders by date range retrieved successfully',
				StatusCodes.OK,
				result
			);
		} catch (error) {
			if (error.message.includes('Invalid date') || error.message.includes('before end date')) {
				return formatFail(res, error.message, StatusCodes.BAD_REQUEST);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});
}

export default new OrderController();
