import { StatusCodes } from 'http-status-codes';
import PaymentService from './payment.service.js';
import { catchAsync } from '../../configs/catchAsync.js';
import { ValidationPayment } from './payment.validation.js';
import {
	formatSuccess,
	formatFail,
	formatError,
} from '../../shared/response/responseFormatter.js';

class PaymentController {
	constructor() {
		if (PaymentController.instance) return PaymentController.instance;
		PaymentController.instance = this;
	}

	/**
	 * Tạo URL thanh toán VNPay
	 * POST /api/payments/vnpay/create
	 */
	createPaymentUrl = catchAsync(async (req, res) => {
		const { error } = ValidationPayment.createPaymentUrl.validate(req.body, {
			abortEarly: false,
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
			const paymentUrl = await PaymentService.createPaymentUrl(req.body);
			return formatSuccess({
				res,
				message: 'Payment URL created successfully',
				code: StatusCodes.OK,
				data: paymentUrl,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Xử lý callback từ VNPay
	 * GET /api/payments/vnpay/callback
	 */
	handlePaymentCallback = catchAsync(async (req, res) => {
		const { error } = ValidationPayment.vnpayCallback.validate(req.query, {
			abortEarly: false,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Invalid callback parameters',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			const result = await PaymentService.handlePaymentCallback(req.query);

			if (result.success) {
				return formatSuccess({
					res,
					message: result.message,
					code: StatusCodes.OK,
					data: result,
				});
			} else {
				return formatFail({
					res,
					message: result.message,
					code: StatusCodes.BAD_REQUEST,
				});
			}
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Tạo payment cho COD/Banking
	 * POST /api/payments/create
	 */
	createPayment = catchAsync(async (req, res) => {
		const { error } = ValidationPayment.createPayment.validate(req.body, {
			abortEarly: false,
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
			const payment = await PaymentService.createPayment(req.body);
			return formatSuccess({
				res,
				message: 'Payment created successfully',
				code: StatusCodes.CREATED,
				data: payment,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Lấy thông tin payment theo ID
	 * GET /api/payments/:paymentId
	 */
	getPaymentById = catchAsync(async (req, res) => {
		const { paymentId } = req.params;

		const { error } = ValidationPayment.getPaymentById.validate({
			paymentId,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const payment = await PaymentService.getPaymentById(paymentId);

			if (!payment) {
				return formatFail({
					res,
					message: 'Payment not found',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				message: 'Payment retrieved successfully',
				code: StatusCodes.OK,
				data: payment,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Lấy danh sách payments của user
	 * GET /api/payments/user/:userId
	 */
	getPaymentsByUserId = catchAsync(async (req, res) => {
		const { userId } = req.params;

		const { error } = ValidationPayment.getPaymentsByUserId.validate({
			userId,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const payments = await PaymentService.getPaymentsByUserId(userId);
			return formatSuccess({
				res,
				message: 'Payments retrieved successfully',
				code: StatusCodes.OK,
				data: payments,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Cập nhật trạng thái payment
	 * PATCH /api/payments/:paymentId/status
	 */
	updatePaymentStatus = catchAsync(async (req, res) => {
		const { paymentId } = req.params;
		const { status } = req.body;

		const { error } = ValidationPayment.updatePaymentStatus.validate({
			paymentId,
			status,
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
			const payment = await PaymentService.updatePaymentStatus(
				paymentId,
				status
			);

			if (!payment) {
				return formatFail({
					res,
					message: 'Payment not found',
					code: StatusCodes.NOT_FOUND,
				});
			}

			return formatSuccess({
				res,
				message: 'Payment status updated successfully',
				code: StatusCodes.OK,
				data: payment,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Hoàn tiền
	 * POST /api/payments/refund
	 */
	refundPayment = catchAsync(async (req, res) => {
		const { error } = ValidationPayment.refundPayment.validate(req.body);

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const result = await PaymentService.refundPayment(req.body.orderId);
			return formatSuccess({
				res,
				message: result.message,
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
}

export default new PaymentController();
