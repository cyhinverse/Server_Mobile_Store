import Joi from 'joi';

// Order status enum validation
const orderStatusEnum = [
	'pending',
	'confirmed',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
	'refunded'
];

// Payment method enum validation
const paymentMethodEnum = [
	'cash',
	'card',
	'bank_transfer',
	'e_wallet',
	'installment'
];

// Order item schema for validation
const orderItemSchema = Joi.object({
	productId: Joi.string()
		.required()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.messages({
			'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
		}),
	variantId: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.allow(null)
		.messages({
			'string.pattern.base': 'Variant ID must be a valid MongoDB ObjectId',
		}),
	quantity: Joi.number()
		.integer()
		.min(1)
		.required()
		.messages({
			'number.min': 'Quantity must be at least 1',
		}),
	price: Joi.number()
		.positive()
		.required()
		.messages({
			'number.positive': 'Price must be a positive number',
		}),
});

// Shipping address schema
const shippingAddressSchema = Joi.object({
	fullName: Joi.string()
		.trim()
		.min(2)
		.max(100)
		.required()
		.messages({
			'string.min': 'Full name must be at least 2 characters',
			'string.max': 'Full name cannot exceed 100 characters',
		}),
	phone: Joi.string()
		.trim()
		.pattern(/^[0-9+\-\s()]{10,15}$/)
		.required()
		.messages({
			'string.pattern.base': 'Phone number must be valid (10-15 digits)',
		}),
	address: Joi.string()
		.trim()
		.min(10)
		.max(500)
		.required()
		.messages({
			'string.min': 'Address must be at least 10 characters',
			'string.max': 'Address cannot exceed 500 characters',
		}),
	city: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.required()
		.messages({
			'string.min': 'City must be at least 2 characters',
			'string.max': 'City cannot exceed 50 characters',
		}),
	district: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.optional()
		.messages({
			'string.min': 'District must be at least 2 characters',
			'string.max': 'District cannot exceed 50 characters',
		}),
	ward: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.optional()
		.messages({
			'string.min': 'Ward must be at least 2 characters',
			'string.max': 'Ward cannot exceed 50 characters',
		}),
	postalCode: Joi.string()
		.trim()
		.pattern(/^[0-9]{5,10}$/)
		.optional()
		.messages({
			'string.pattern.base': 'Postal code must be 5-10 digits',
		}),
});

export const OrderValidation = {
	// Create order validation
	createOrder: Joi.object({
		items: Joi.array()
			.items(orderItemSchema)
			.min(1)
			.required()
			.messages({
				'array.min': 'Order must contain at least one item',
			}),
		shippingAddress: shippingAddressSchema.required(),
		paymentMethod: Joi.string()
			.valid(...paymentMethodEnum)
			.required()
			.messages({
				'any.only': 'Payment method must be one of: ' + paymentMethodEnum.join(', '),
			}),
		note: Joi.string()
			.trim()
			.max(500)
			.optional()
			.allow('')
			.messages({
				'string.max': 'Note cannot exceed 500 characters',
			}),
		discountCode: Joi.string()
			.trim()
			.max(50)
			.optional()
			.messages({
				'string.max': 'Discount code cannot exceed 50 characters',
			}),
		shippingFee: Joi.number()
			.min(0)
			.optional()
			.messages({
				'number.min': 'Shipping fee cannot be negative',
			}),
	}),

	// Update order status validation
	updateStatus: Joi.object({
		status: Joi.string()
			.valid(...orderStatusEnum)
			.required()
			.messages({
				'any.only': 'Status must be one of: ' + orderStatusEnum.join(', '),
			}),
	}),

	// Update order note validation
	updateNote: Joi.object({
		note: Joi.string()
			.trim()
			.max(500)
			.required()
			.messages({
				'string.max': 'Note cannot exceed 500 characters',
			}),
	}),

	// Update payment method validation
	updatePaymentMethod: Joi.object({
		paymentMethod: Joi.string()
			.valid(...paymentMethodEnum)
			.required()
			.messages({
				'any.only': 'Payment method must be one of: ' + paymentMethodEnum.join(', '),
			}),
	}),

	// Date range validation
	dateRange: Joi.object({
		startDate: Joi.date()
			.iso()
			.required()
			.messages({
				'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
			}),
		endDate: Joi.date()
			.iso()
			.min(Joi.ref('startDate'))
			.required()
			.messages({
				'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
				'date.min': 'End date must be after or equal to start date',
			}),
		page: Joi.number()
			.integer()
			.min(1)
			.optional()
			.messages({
				'number.min': 'Page must be at least 1',
			}),
		limit: Joi.number()
			.integer()
			.min(1)
			.max(100)
			.optional()
			.messages({
				'number.min': 'Limit must be at least 1',
				'number.max': 'Limit cannot exceed 100',
			}),
	}),

	// Query parameters validation for filtering
	filterOrders: Joi.object({
		status: Joi.string()
			.valid(...orderStatusEnum)
			.optional(),
		paymentMethod: Joi.string()
			.valid(...paymentMethodEnum)
			.optional(),
		dateFrom: Joi.date()
			.iso()
			.optional(),
		dateTo: Joi.date()
			.iso()
			.min(Joi.ref('dateFrom'))
			.optional(),
		minTotal: Joi.number()
			.min(0)
			.optional(),
		maxTotal: Joi.number()
			.min(Joi.ref('minTotal'))
			.optional(),
		page: Joi.number()
			.integer()
			.min(1)
			.optional(),
		limit: Joi.number()
			.integer()
			.min(1)
			.max(100)
			.optional(),
	}),

	// MongoDB ObjectId validation
	mongoId: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
		}),
};
