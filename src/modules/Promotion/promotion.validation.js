import joi from 'joi';

const PromotionValidation = {
	createPromotion: joi
		.object({
			title: joi.string().min(3).max(100).required().messages({
				'string.empty': 'Title is required',
				'string.min': 'Title must be at least 3 characters long',
				'string.max': 'Title cannot exceed 100 characters',
				'any.required': 'Title is required',
			}),
			description: joi.string().max(500).optional().messages({
				'string.max': 'Description cannot exceed 500 characters',
			}),
			applicableProducts: joi
				.array()
				.items(
					joi
						.string()
						.pattern(/^[0-9a-fA-F]{24}$/)
						.message('Invalid product ID format')
				)
				.optional()
				.messages({
					'array.base': 'Applicable products must be an array',
				}),
			discountPercent: joi.number().min(0).max(100).optional().messages({
				'number.base': 'Discount percent must be a number',
				'number.min': 'Discount percent cannot be negative',
				'number.max': 'Discount percent cannot exceed 100',
			}),
			discountAmount: joi.number().min(0).optional().messages({
				'number.base': 'Discount amount must be a number',
				'number.min': 'Discount amount cannot be negative',
			}),
			startDate: joi.date().iso().required().messages({
				'date.base': 'Start date must be a valid date',
				'date.format': 'Start date must be in ISO format',
				'any.required': 'Start date is required',
			}),
			endDate: joi
				.date()
				.iso()
				.greater(joi.ref('startDate'))
				.required()
				.messages({
					'date.base': 'End date must be a valid date',
					'date.format': 'End date must be in ISO format',
					'date.greater': 'End date must be after start date',
					'any.required': 'End date is required',
				}),
			isActive: joi.boolean().optional().messages({
				'boolean.base': 'isActive must be a boolean',
			}),
		})
		.custom((value, helpers) => {
			// Ensure at least one discount type is provided
			if (!value.discountPercent && !value.discountAmount) {
				return helpers.error('custom.discountRequired');
			}

			// Ensure only one discount type is provided
			if (value.discountPercent && value.discountAmount) {
				return helpers.error('custom.discountConflict');
			}

			return value;
		})
		.messages({
			'custom.discountRequired':
				'Either discount percent or discount amount is required',
			'custom.discountConflict':
				'Cannot have both discount percent and discount amount',
		}),

	updatePromotion: joi
		.object({
			title: joi.string().min(3).max(100).optional().messages({
				'string.min': 'Title must be at least 3 characters long',
				'string.max': 'Title cannot exceed 100 characters',
			}),
			description: joi.string().max(500).optional().messages({
				'string.max': 'Description cannot exceed 500 characters',
			}),
			applicableProducts: joi
				.array()
				.items(
					joi
						.string()
						.pattern(/^[0-9a-fA-F]{24}$/)
						.message('Invalid product ID format')
				)
				.optional()
				.messages({
					'array.base': 'Applicable products must be an array',
				}),
			discountPercent: joi.number().min(0).max(100).optional().messages({
				'number.base': 'Discount percent must be a number',
				'number.min': 'Discount percent cannot be negative',
				'number.max': 'Discount percent cannot exceed 100',
			}),
			discountAmount: joi.number().min(0).optional().messages({
				'number.base': 'Discount amount must be a number',
				'number.min': 'Discount amount cannot be negative',
			}),
			startDate: joi.date().iso().optional().messages({
				'date.base': 'Start date must be a valid date',
				'date.format': 'Start date must be in ISO format',
			}),
			endDate: joi.date().iso().optional().messages({
				'date.base': 'End date must be a valid date',
				'date.format': 'End date must be in ISO format',
			}),
			isActive: joi.boolean().optional().messages({
				'boolean.base': 'isActive must be a boolean',
			}),
		})
		.custom((value, helpers) => {
			// If both start and end dates are provided, ensure end date is after start date
			if (
				value.startDate &&
				value.endDate &&
				value.endDate <= value.startDate
			) {
				return helpers.error('custom.endDateInvalid');
			}

			// If discount values are provided, ensure only one type
			if (value.discountPercent && value.discountAmount) {
				return helpers.error('custom.discountConflict');
			}

			return value;
		})
		.messages({
			'custom.endDateInvalid': 'End date must be after start date',
			'custom.discountConflict':
				'Cannot have both discount percent and discount amount',
		}),

	promotionId: joi.object({
		id: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.pattern.base': 'Invalid promotion ID format',
				'any.required': 'Promotion ID is required',
			}),
	}),

	queryPromotion: joi.object({
		page: joi.number().integer().min(1).optional().messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),
		limit: joi.number().integer().min(1).max(100).optional().messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit cannot exceed 100',
		}),
		isActive: joi.boolean().optional().messages({
			'boolean.base': 'isActive must be a boolean',
		}),
		search: joi.string().max(100).optional().messages({
			'string.max': 'Search term cannot exceed 100 characters',
		}),
		sortBy: joi
			.string()
			.valid('title', 'startDate', 'endDate', 'createdAt')
			.optional()
			.messages({
				'any.only':
					'Sort by must be one of: title, startDate, endDate, createdAt',
			}),
		sortOrder: joi.string().valid('asc', 'desc').optional().messages({
			'any.only': 'Sort order must be either asc or desc',
		}),
	}),

	// Validation for product IDs array
	productIds: joi.object({
		productIds: joi
			.array()
			.items(
				joi
					.string()
					.pattern(/^[0-9a-fA-F]{24}$/)
					.message('Invalid product ID format')
			)
			.min(1)
			.required()
			.messages({
				'array.base': 'Product IDs must be an array',
				'array.min': 'At least one product ID is required',
				'any.required': 'Product IDs are required',
			}),
	}),
};

export default PromotionValidation;
