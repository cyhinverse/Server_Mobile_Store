import joi from 'joi';

export const VariantValidation = {
	createVariant: joi.object({
		product_id: joi.string().required(),
		color: joi.string().required(),
		storage: joi.string().required(),
		price: joi
			.object({
				originalPrice: joi.number().min(0).required(),
				discountedPrice: joi.number().min(0).optional(),
				discountType: joi.string().valid('percentage', 'fixed').optional(),
				discountValue: joi.number().min(0).optional(),
				discountStartDate: joi.date().optional(),
				discountEndDate: joi.date().optional(),
				discountCode: joi.string().trim().optional(),
				discountDescription: joi.string().trim().optional(),
				currency: joi.string().valid('VND').default('VND'),
			})
			.required(),
		stock: joi.number().integer().min(0).default(0),
		sku: joi.string().optional(),
		image_url: joi.string().uri().optional(),
	}),
};
