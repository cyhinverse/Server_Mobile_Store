import joi from 'joi';

export const ValidationCategory = {
	createCategory: joi.object({
		name: joi.string().required().messages({
			'string.empty': 'Name is required',
			'any.required': 'Name is required',
		}),
		parentId: joi.string().optional().allow(null, '').messages({
			'string.base': 'Parent ID must be a string',
		}),
		description: joi.string().optional().messages({
			'string.empty': 'Description must be a valid string',
		}),
	}),

	deleteCategory: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Category ID is required',
			'any.required': 'Category ID is required',
		}),
	}),

	updateCategory: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Category ID is required',
			'any.required': 'Category ID is required',
		}),
		name: joi.string().optional().messages({
			'string.empty': 'Name must be a valid string',
		}),
		parentId: joi.string().optional().allow(null, '').messages({
			'string.base': 'Parent ID must be a string',
		}),
		description: joi.string().optional().messages({
			'string.empty': 'Description must be a valid string',
		}),
	}),

	getCategoryById: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Category ID is required',
			'any.required': 'Category ID is required',
		}),
	}),

	getCategoryBySlug: joi.object({
		slug: joi.string().required().messages({
			'string.empty': 'Slug is required',
			'any.required': 'Slug is required',
		}),
	}),

	getCategoriesPaginated: joi.object({
		page: joi.number().integer().min(1).optional().messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),
		limit: joi.number().integer().min(1).optional().messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
		}),
		search: joi.string().allow('', null).optional().messages({
			'string.base': 'Search must be a string',
		}),
	}),
};
