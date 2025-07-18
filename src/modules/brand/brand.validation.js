import joi from 'joi';

export const ValidationBrand = {
	createBrand: joi.object({
		name: joi.string().required().messages({
			'string.empty': 'Name is required',
			'any.required': 'Name is required',
		}),
		logo: joi.string().optional().allow('').messages({
			'string.base': 'Logo must be a valid URL string',
		}),
		description: joi.string().optional().allow('').messages({
			'string.base': 'Description must be a valid string',
		}),
		isActive: joi.boolean().optional().messages({
			'boolean.base': 'isActive must be a boolean value',
		}),
	}),

	deleteBrand: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Brand ID is required',
			'any.required': 'Brand ID is required',
		}),
	}),

	updateBrand: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Brand ID is required',
			'any.required': 'Brand ID is required',
		}),
		name: joi.string().optional().messages({
			'string.empty': 'Name must be a valid string',
		}),
		logo: joi.string().optional().allow('').messages({
			'string.base': 'Logo must be a valid URL string',
		}),
		description: joi.string().optional().allow('').messages({
			'string.base': 'Description must be a valid string',
		}),
		isActive: joi.boolean().optional().messages({
			'boolean.base': 'isActive must be a boolean value',
		}),
	}),

	getBrandById: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Brand ID is required',
			'any.required': 'Brand ID is required',
		}),
	}),

	getBrandsPaginated: joi.object({
		page: joi.number().integer().min(1).optional().messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),
		limit: joi.number().integer().min(1).max(100).optional().messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit must not exceed 100',
		}),
		search: joi.string().optional().allow('').messages({
			'string.base': 'Search must be a string',
		}),
		isActive: joi.boolean().optional().messages({
			'boolean.base': 'isActive must be a boolean value',
		}),
	}),
};
