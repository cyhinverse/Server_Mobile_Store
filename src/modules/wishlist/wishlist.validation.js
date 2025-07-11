import joi from 'joi';

export const WishListValidation = {
	create: joi.object({
		userId: joi.string().required(),
		productId: joi.string().required(),
	}),
	delete: joi.object({
		userId: joi.string().required(),
		productId: joi.string().required(),
	}),
	update: joi.object({
		userId: joi.string().required(),
		productId: joi.string().required(),
	}),
	clear: joi.object({
		userId: joi.string().required(),
	}),
	get: joi.object({
		userId: joi.string().required(),
	}),
};
