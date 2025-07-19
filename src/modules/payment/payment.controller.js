import { StatusCodes } from 'http-status-codes';
import PaymentService from './payment.service.js';
import { catchAsync } from '../../configs/catchAsync.js';
class PaymentController {
	constructor() {
		if (PaymentController.instance) return PaymentController.instance;
		PaymentController.instance = this;
	}

	createPaymentUrl = catchAsync(async (req, res) => {
		const { orderInfo } = req.body;
		if (!orderInfo) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Order information is required to create payment URL',
			});
		}
		const paymentUrl = await PaymentService.createPaymentUrl(orderInfo);
		if (!paymentUrl) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to create payment URL',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Payment URL created successfully',
			data: paymentUrl,
		});
	});
	handlePaymentCallback = catchAsync(async (req, res) => {
		const { query } = req;
		if (!query) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Query parameters are required for payment callback',
			});
		}
		const result = await PaymentService.handlePaymentCallback(query);
		if (!result) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to handle payment callback',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Payment callback handled successfully',
			data: result,
		});
	});
	verifyVNPaySignature = catchAsync(async (req, res) => {
		const { query } = req;
		if (!query) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message:
					'Query parameters are required for VNPay signature verification',
			});
		}
		const isValid = await PaymentService.verifyVNPaySignature(query);
		if (!isValid) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Invalid VNPay signature',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'VNPay signature verified successfully',
			data: isValid,
		});
	});
	generateVNPayParams = catchAsync(async (req, res) => {
		const { order } = req.body;
		if (!order) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Order information is required to generate VNPay parameters',
			});
		}
		const params = await PaymentService.generateVNPayParams(order);
		if (!params) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to generate VNPay parameters',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'VNPay parameters generated successfully',
			data: params,
		});
	});
	refundPayment = catchAsync(async (req, res) => {
		const { orderId } = req.body;
		if (!orderId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Order ID is required for refund',
			});
		}
		const result = await PaymentService.refundPayment(orderId);
		if (!result) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to process refund',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Refund processed successfully',
			data: result,
		});
	});
}

export default new PaymentController();
