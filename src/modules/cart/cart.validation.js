import Joi from 'joi';

// MongoDB ObjectId validation pattern
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const ValidationCart = {
	/**
	 * Validation for adding item to cart
	 */
	addToCart: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
			'any.required': 'User ID is required',
		}),

		productId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
			'any.required': 'Product ID is required',
		}),

		quantity: Joi.number().integer().min(1).max(100).required().messages({
			'number.base': 'Quantity must be a number',
			'number.integer': 'Quantity must be an integer',
			'number.min': 'Quantity must be at least 1',
			'number.max': 'Quantity cannot exceed 100',
			'any.required': 'Quantity is required',
		}),
	}),

	/**
	 * Validation for updating cart quantity
	 */
	updateQuantity: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
			'any.required': 'User ID is required',
		}),

		productId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
			'any.required': 'Product ID is required',
		}),

		quantity: Joi.number().integer().min(1).max(100).required().messages({
			'number.base': 'Quantity must be a number',
			'number.integer': 'Quantity must be an integer',
			'number.min': 'Quantity must be at least 1',
			'number.max': 'Quantity cannot exceed 100',
			'any.required': 'Quantity is required',
		}),
	}),

	/**
	 * Validation for removing item from cart
	 */
	removeFromCart: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
			'any.required': 'User ID is required',
		}),

		productId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
			'any.required': 'Product ID is required',
		}),
	}),

	/**
	 * Validation for bulk remove from cart
	 */
	bulkRemove: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
			'any.required': 'User ID is required',
		}),

		productIds: Joi.array()
			.items(
				Joi.string().pattern(objectIdPattern).messages({
					'string.pattern.base':
						'Each Product ID must be a valid MongoDB ObjectId',
				})
			)
			.min(1)
			.required()
			.messages({
				'array.min': 'At least one Product ID is required',
				'any.required': 'Product IDs are required',
			}),
	}),

	/**
	 * Validation for decreasing quantity
	 */
	decreaseQuantity: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
			'any.required': 'User ID is required',
		}),

		productId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
			'any.required': 'Product ID is required',
		}),

		decreaseBy: Joi.number().integer().min(1).max(100).required().messages({
			'number.base': 'Decrease amount must be a number',
			'number.integer': 'Decrease amount must be an integer',
			'number.min': 'Decrease amount must be at least 1',
			'number.max': 'Decrease amount cannot exceed 100',
			'any.required': 'Decrease amount is required',
		}),
	}),

	/**
	 * Validation for user ID parameter
	 */
	userId: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
			'any.required': 'User ID is required',
		}),
	}),

	/**
	 * Validation for product ID parameter
	 */
	productId: Joi.object({
		productId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
			'any.required': 'Product ID is required',
		}),
	}),

	/**
	 * Validation for pagination query parameters
	 */
	paginationQuery: Joi.object({
		page: Joi.number().integer().min(1).default(1).messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),

		limit: Joi.number().integer().min(1).max(100).default(10).messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit must not exceed 100',
		}),

		userId: Joi.string().pattern(objectIdPattern).allow('').messages({
			'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
		}),

		search: Joi.string().trim().allow('').max(100).messages({
			'string.max': 'Search term must not exceed 100 characters',
		}),
	}),

	/**
	 * Validation for abandoned carts query
	 */
	abandonedCartsQuery: Joi.object({
		days: Joi.number().integer().min(1).max(365).default(7).messages({
			'number.base': 'Days must be a number',
			'number.integer': 'Days must be an integer',
			'number.min': 'Days must be at least 1',
			'number.max': 'Days cannot exceed 365',
		}),
	}),
};
