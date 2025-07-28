import joi from 'joi';

export const WishListValidation = {
	addToWishlist: joi.object({
		productId: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'Product ID is required!',
				'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId!',
			}),
	}),

	mongoId: joi.object({
		productId: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'Product ID is required!',
				'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId!',
			}),
	}),

	query: joi.object({
		page: joi.number().integer().min(1).optional().default(1),
		limit: joi.number().integer().min(1).max(100).optional().default(10),
	}),
};
