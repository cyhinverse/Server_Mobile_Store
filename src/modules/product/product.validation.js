import joi from 'joi';

const ValidationProduct = {
	createProduct: joi.object({
		name: joi.string().required().messages({
			'string.empty': 'Name is required',
			'any.required': 'Name is required',
		}),
		price: joi.number().min(0).required().messages({
			'number.base': 'Price must be a number',
			'number.min': 'Price cannot be negative',
			'any.required': 'Price is required',
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
				'any.only': 'Status must be one of active, out_of_stock, or disabled',
				'any.required': 'Status is required',
			}),
		category_id: joi.string().required().messages({
			'string.empty': 'Category ID is required',
			'any.required': 'Category ID is required',
		}),
		isNewProduct: joi.boolean().required().messages({
			'boolean.base': 'isNewProduct must be a boolean',
			'any.required': 'isNewProduct is required',
		}),
		isFeatured: joi.boolean().required().messages({
			'boolean.base': 'isFeatured must be a boolean',
			'any.required': 'isFeatured is required',
		}),
		productDetail: joi
			.object({
				description: joi.string().required().messages({
					'string.empty': 'Description is required',
					'any.required': 'Description is required',
				}),
				rating: joi.number().min(0).max(5).default(0),
				images: joi.array().items(joi.string().uri()).required().messages({
					'array.base': 'Images must be an array of URLs',
					'any.required': 'Images are required',
				}),
				specs: joi
					.object({
						screenSize: joi.string().required(),
						screenTechnology: joi.string().required(),
						nearCamera: joi.string().required(),
						frontCamera: joi.string().required(),
						chipset: joi.string().required(),
						ram: joi.string().required(),
						currentStorage: joi.string().required(),
						battery: joi.string().required(),
						sim: joi.string().required(),
						os: joi.string().required(),
						screenResolution: joi.string().required(),
						screenFeatures: joi.string().required(),
						cpu: joi.string().required(),
					})
					.required()
					.messages({
						'any.required': 'Specs are required',
						'object.base': 'Specs must be an object',
					}),
			})
			.required()
			.messages({
				'any.required': 'Product detail is required',
				'object.base': 'Product detail must be an object',
			}),
	}),

	updateProduct: joi.object({
		name: joi.string().optional(),
		thumbnail: joi.string().uri().optional(),
		stock: joi.number().integer().min(0).optional(),
		sold: joi.number().integer().min(0).optional(),
		status: joi.string().valid('active', 'out_of_stock', 'disabled').optional(),
		category_id: joi.string().optional(),
		isNewProduct: joi.boolean().optional(),
		detail_id: joi.string().optional(),
	}),
	filterProducts: joi.object({
		name: joi.string().optional(),
		maxPrice: joi.number().optional(),
		minPrice: joi.number().optional(),
		isNewProduct: joi.boolean().optional(),
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
