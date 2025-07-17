import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import OrderService from './order.service.js';

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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Create order failed !',
				success: false,
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'Create order successfully!',
			success: true,
		});
	});
	deleteOrder = catchAsync(async (req, res) => {
		const { id } = req.params;
		const deleted = await OrderService.deleteOrder(id);
		if (!deleted) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Delete order failed',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Delete order successfully !',
			success: true,
		});
	});
	updateStatus = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { status } = req.body;

		const updated = await OrderService.updateStatus(id, status);
		if (!updated) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Update status failed',
				success: false,
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'Update status successfully !',
			success: true,
		});
	});
	updateNote = catchAsync(async (req, res) => {
		const { userId } = req.user;
		const { note } = req.body;

		const updatedOrder = await OrderService.updateNote(userId, note);
		if (!updatedOrder) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Update note failed',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Update note successfully !',
			success: true,
		});
	});
	cancelOrder = catchAsync(async (req, res) => {
		const { id } = req.params;
		const cancelledOrder = await OrderService.cancelOrder(id);
		if (!cancelledOrder) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Cancel order failed',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Cancel order successfully !',
			success: true,
		});
	});
	getOrderById = catchAsync(async (req, res) => {
		const { id } = req.params;
		const order = await OrderService.getOrderById(id);
		if (!order) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'Order not found',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Get order successfully !',
			success: true,
			data: order,
		});
	});
	getOrderByUserId = catchAsync(async (req, res) => {
		const { userId } = req.user;
		const orders = await OrderService.getOrderByUserId(userId);
		if (!orders || orders.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No orders found for this user',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Get orders successfully !',
			success: true,
			data: orders,
		});
	});
	getAllOrders = catchAsync(async (req, res) => {
		const orders = await OrderService.getAllOrders();
		if (!orders || orders.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No orders found',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Get all orders successfully !',
			success: true,
			data: orders,
		});
	});
}

export default new OrderController();
