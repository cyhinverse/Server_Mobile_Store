import Joi from 'joi';

export const ValidationPayment = {
	// Validation cho tạo payment URL (VNPay)
	createPaymentUrl: Joi.object({
		orderId: Joi.string()
			.required()
			.regex(/^[0-9a-fA-F]{24}$/)
			.messages({
				'string.empty': 'Order ID không được để trống',
				'string.pattern.base': 'Order ID không hợp lệ',
				'any.required': 'Order ID là bắt buộc',
			}),
		amount: Joi.number().min(1000).required().messages({
			'number.base': 'Số tiền phải là số',
			'number.min': 'Số tiền tối thiểu là 1,000 VND',
			'any.required': 'Số tiền là bắt buộc',
		}),
		orderDescription: Joi.string().max(255).optional().messages({
			'string.max': 'Mô tả đơn hàng không được vượt quá 255 ký tự',
		}),
		ipAddr: Joi.string().ip().optional().messages({
			'string.ip': 'Địa chỉ IP không hợp lệ',
		}),
	}),

	// Validation cho tạo payment thông thường (COD, Banking)
	createPayment: Joi.object({
		userId: Joi.string()
			.required()
			.regex(/^[0-9a-fA-F]{24}$/)
			.messages({
				'string.empty': 'User ID không được để trống',
				'string.pattern.base': 'User ID không hợp lệ',
				'any.required': 'User ID là bắt buộc',
			}),
		orderId: Joi.string()
			.required()
			.regex(/^[0-9a-fA-F]{24}$/)
			.messages({
				'string.empty': 'Order ID không được để trống',
				'string.pattern.base': 'Order ID không hợp lệ',
				'any.required': 'Order ID là bắt buộc',
			}),
		amount: Joi.number().min(0).required().messages({
			'number.base': 'Số tiền phải là số',
			'number.min': 'Số tiền không được âm',
			'any.required': 'Số tiền là bắt buộc',
		}),
		method: Joi.string()
			.valid('cod', 'banking', 'vnpay')
			.default('cod')
			.messages({
				'string.base': 'Phương thức thanh toán phải là chuỗi',
				'any.only':
					'Phương thức thanh toán phải là một trong: cod, banking, vnpay',
			}),
	}),

	// Validation cho cập nhật payment status
	updatePaymentStatus: Joi.object({
		paymentId: Joi.string()
			.required()
			.regex(/^[0-9a-fA-F]{24}$/)
			.messages({
				'string.empty': 'Payment ID không được để trống',
				'string.pattern.base': 'Payment ID không hợp lệ',
				'any.required': 'Payment ID là bắt buộc',
			}),
		status: Joi.string()
			.valid('pending', 'completed', 'failed')
			.required()
			.messages({
				'string.base': 'Trạng thái phải là chuỗi',
				'any.only':
					'Trạng thái phải là một trong: pending, completed, failed',
				'any.required': 'Trạng thái là bắt buộc',
			}),
	}),

	// Validation cho refund payment
	refundPayment: Joi.object({
		orderId: Joi.string()
			.required()
			.regex(/^[0-9a-fA-F]{24}$/)
			.messages({
				'string.empty': 'Order ID không được để trống',
				'string.pattern.base': 'Order ID không hợp lệ',
				'any.required': 'Order ID là bắt buộc',
			}),
	}),

	// Validation cho VNPay callback
	vnpayCallback: Joi.object({
		vnp_TmnCode: Joi.string().required(),
		vnp_Amount: Joi.string().required(),
		vnp_BankCode: Joi.string().optional(),
		vnp_BankTranNo: Joi.string().optional(),
		vnp_CardType: Joi.string().optional(),
		vnp_PayDate: Joi.string().required(),
		vnp_OrderInfo: Joi.string().required(),
		vnp_TransactionNo: Joi.string().required(),
		vnp_ResponseCode: Joi.string().required(),
		vnp_TransactionStatus: Joi.string().required(),
		vnp_TxnRef: Joi.string().required(),
		vnp_SecureHashType: Joi.string().optional(),
		vnp_SecureHash: Joi.string().required(),
	}).unknown(true), // Cho phép các field khác từ VNPay

	// Validation cho get payment by ID
	getPaymentById: Joi.object({
		paymentId: Joi.string()
			.required()
			.regex(/^[0-9a-fA-F]{24}$/)
			.messages({
				'string.empty': 'Payment ID không được để trống',
				'string.pattern.base': 'Payment ID không hợp lệ',
				'any.required': 'Payment ID là bắt buộc',
			}),
	}),

	// Validation cho get payments by user ID
	getPaymentsByUserId: Joi.object({
		userId: Joi.string()
			.required()
			.regex(/^[0-9a-fA-F]{24}$/)
			.messages({
				'string.empty': 'User ID không được để trống',
				'string.pattern.base': 'User ID không hợp lệ',
				'any.required': 'User ID là bắt buộc',
			}),
	}),
};
