import Joi from 'joi';

export const ReviewValidation = {
	create: Joi.object({
		userId: Joi.string().required().messages({
			'string.empty': 'User ID is required!',
		}),
		productId: Joi.string().required().messages({
			'string.empty': 'Product ID is required!',
		}),
		rating: Joi.number().integer().min(1).max(5).required().messages({
			'number.base': 'Rating must be a number!',
			'number.min': 'Rating must be at least 1!',
			'number.max': 'Rating must not exceed 5!',
			'number.empty': 'Rating is required!',
		}),
		comment: Joi.string().optional().allow('').messages({
			'string.empty': 'Comment cannot be empty!',
		}),
	}),
	update: Joi.object({
		userId: Joi.string().required().messages({
			'string.empty': 'User ID is required!',
		}),
		productId: Joi.string().required().messages({
			'string.empty': 'Product ID is required!',
		}),
		rating: Joi.number().integer().min(1).max(5).optional().messages({
			'number.base': 'Rating must be a number!',
			'number.min': 'Rating must be at least 1!',
			'number.max': 'Rating must not exceed 5!',
		}),
		comment: Joi.string().optional().allow('').messages({
			'string.empty': 'Comment cannot be empty!',
		}),
	}),
	delete: Joi.object({
		userId: Joi.string().required().messages({
			'string.empty': 'User ID is required!',
		}),
	}),
	getReviews: Joi.object({
		productId: Joi.string().required().messages({
			'string.empty': 'Product ID is required!',
		}),
	}),
	getReviewById: Joi.object({
		id: Joi.string().required().messages({
			'string.empty': 'Review ID is required!',
		}),
	}),
};
