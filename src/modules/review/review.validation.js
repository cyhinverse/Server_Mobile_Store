import Joi from 'joi';

export const ReviewValidation = {
	create: Joi.object({
		productId: Joi.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'Product ID is required!',
				'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId!',
			}),
		rating: Joi.number().integer().min(1).max(5).required().messages({
			'number.base': 'Rating must be a number!',
			'number.min': 'Rating must be at least 1!',
			'number.max': 'Rating must not exceed 5!',
			'any.required': 'Rating is required!',
		}),
		comment: Joi.string().optional().allow('').max(1000).messages({
			'string.max': 'Comment must not exceed 1000 characters!',
		}),
	}),

	update: Joi.object({
		rating: Joi.number().integer().min(1).max(5).optional().messages({
			'number.base': 'Rating must be a number!',
			'number.min': 'Rating must be at least 1!',
			'number.max': 'Rating must not exceed 5!',
		}),
		comment: Joi.string().optional().allow('').max(1000).messages({
			'string.max': 'Comment must not exceed 1000 characters!',
		}),
	}),

	mongoId: Joi.object({
		id: Joi.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'ID is required!',
				'string.pattern.base': 'ID must be a valid MongoDB ObjectId!',
			}),
		productId: Joi.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.optional()
			.messages({
				'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId!',
			}),
		userId: Joi.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.optional()
			.messages({
				'string.pattern.base': 'User ID must be a valid MongoDB ObjectId!',
			}),
	}),

	query: Joi.object({
		page: Joi.number().integer().min(1).optional().default(1),
		limit: Joi.number().integer().min(1).max(100).optional().default(10),
		rating: Joi.number().integer().min(1).max(5).optional(),
		productId: Joi.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.optional(),
		userId: Joi.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.optional(),
	}),
};
