import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import OrderService from './order.service.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class OrderController {
	constructor() {
		if (!OrderController.instance) return OrderController.instance;
		OrderController.instance = this;
	}
	createOrder = catchAsync(async (req, res) => {
		const { userId } = req.user;
		const {
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
			discountCode,
		} = req.body;

		// Basic validation
		if (!variant_id || !quantity) {
			return formatFail({
				res,
				message: 'Variant ID and quantity are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const order = await OrderService.createOrder(
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
			);

			if (!order && order === null) {
				return formatError({
					res,
					message: 'Create order failed!',
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				});
			}

			return formatSuccess({
				res,
				data: order,
				message: 'Create order successfully!',
				code: StatusCodes.CREATED,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Internal server error while creating order',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
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
			const deleted = await OrderService.deleteOrder(id);
			if (!deleted) {
				return formatFail({
					res,
					message: 'Order not found or could not be deleted',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: deleted,
				message: 'Delete order successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Internal server error while deleting order',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	updateStatus = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { status } = req.body;

		if (!id || !status) {
			return formatFail({
				res,
				message: 'Order ID and status are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const updated = await OrderService.updateStatus(id, status);
			if (!updated) {
				return formatFail({
					res,
					message: 'Order not found or status update failed',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: updated,
				message: 'Update status successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Internal server error while updating status',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	updateNote = catchAsync(async (req, res) => {
		const { userId } = req.user;
		const { note } = req.body;

		if (!note) {
			return formatFail({
				res,
				message: 'Note is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const updatedOrder = await OrderService.updateNote(userId, note);
			if (!updatedOrder) {
				return formatFail({
					res,
					message: 'Order not found or note update failed',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: updatedOrder,
				message: 'Update note successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Internal server error while updating note',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
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
			const cancelledOrder = await OrderService.cancelOrder(id);
			if (!cancelledOrder) {
				return formatFail({
					res,
					message: 'Order not found or could not be cancelled',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: cancelledOrder,
				message: 'Cancel order successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message:
					error.message || 'Internal server error while cancelling order',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
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
			if (!order) {
				return formatFail({
					res,
					message: 'Order not found',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: order,
				message: 'Get order successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message:
					error.message || 'Internal server error while retrieving order',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	getOrderByUserId = catchAsync(async (req, res) => {
		const { userId } = req.user;

		try {
			const orders = await OrderService.getOrderByUserId(userId);
			if (!orders || orders.length === 0) {
				return formatFail({
					res,
					message: 'No orders found for this user',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: orders,
				message: 'Get orders successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message:
					error.message || 'Internal server error while retrieving user orders',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	getAllOrders = catchAsync(async (req, res) => {
		try {
			const orders = await OrderService.getAllOrders();
			if (!orders || orders.length === 0) {
				return formatFail({
					res,
					message: 'No orders found',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: orders,
				message: 'Get all orders successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message:
					error.message || 'Internal server error while retrieving all orders',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	getOrdersByStatus = catchAsync(async (req, res) => {
		const { status } = req.params;

		if (!status) {
			return formatFail({
				res,
				message: 'Status is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const orders = await OrderService.getOrdersByStatus(status);
			if (!orders || orders.length === 0) {
				return formatFail({
					res,
					message: 'No orders found with this status',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: orders,
				message: 'Get orders by status successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message:
					error.message ||
					'Internal server error while retrieving orders by status',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	updatePayementMethod = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { payment_method } = req.body;

		if (!id || !payment_method) {
			return formatFail({
				res,
				message: 'Order ID and payment method are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const updatedOrder = await OrderService.updatePayementMethod(
				id,
				payment_method
			);
			if (!updatedOrder) {
				return formatFail({
					res,
					message: 'Order not found or payment method update failed',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				data: updatedOrder,
				message: 'Update payment method successfully!',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message:
					error.message ||
					'Internal server error while updating payment method',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
}

export default new OrderController();
