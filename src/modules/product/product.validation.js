import joi from 'joi';

const ValidationProduct = {
	createProduct: joi.object({
		name: joi.string().required().messages({
			'string.empty': 'Name is required',
			'any.required': 'Name is required',
		}),
		thumbnail: joi.string().uri().required().messages({
			'string.uri': 'Thumbnail must be a valid URL',
			'any.required': 'Thumbnail is required',
		}),
		stock: joi.number().integer().min(0).required().messages({
			'number.base': 'Stock must be a number',
			'number.integer': 'Stock must be an integer',
			'number.min': 'Stock cannot be negative',
			'any.required': 'Stock is required',
		}),
		sold: joi.number().integer().min(0).required().messages({
			'number.base': 'Sold must be a number',
			'number.integer': 'Sold must be an integer',
			'number.min': 'Sold cannot be negative',
			'any.required': 'Sold is required',
		}),
		status: joi
			.string()
			.valid('active', 'out_of_stock', 'disabled')
			.required()
			.messages({
				'string.valid':
					'Status must be one of active, out_of_stock, or disabled',
				'any.required': 'Status is required',
			}),
		category_id: joi.string().required().messages({
			'string.empty': 'Category ID is required',
			'any.required': 'Category ID is required',
		}),
		isNew: joi.boolean().required().messages({
			'boolean.base': 'isNew must be a boolean',
			'any.required': 'isNew is required',
		}),
		detail_id: joi.string().required().messages({
			'string.empty': 'Detail ID is required',
			'any.required': 'Detail ID is required',
		}),
	}),
	updateProduct: joi.object({
		name: joi.string().optional(),
		thumbnail: joi.string().uri().optional(),
		stock: joi.number().integer().min(0).optional(),
		sold: joi.number().integer().min(0).optional(),
		status: joi.string().valid('active', 'out_of_stock', 'disabled').optional(),
		category_id: joi.string().optional(),
		isNew: joi.boolean().optional(),
		detail_id: joi.string().optional(),
	}),
	filterProducts: joi.object({
		name: joi.string().optional(),
		maxPrice: joi.number().optional(),
		minPrice: joi.number().optional(),
		isNew: joi.boolean().optional(),
		color: joi.string().optional(),
		rating: joi.number().min(0).max(5).optional(),
		isFeatured: joi.boolean().optional(),
		storage: joi.string().optional(),
		chipset: joi.string().optional(),
		ram: joi.string().optional(),
		battery: joi.string().optional(),
		os: joi.string().optional(),
	}),
};

export default ValidationProduct;
