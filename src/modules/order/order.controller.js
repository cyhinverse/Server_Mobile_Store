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
		const { productId, quantity } = req.body;
		const order = await OrderService.createOrder(
			userId,
			productId,
			quantity,
			price
		);
	});
}

export default new OrderController();
