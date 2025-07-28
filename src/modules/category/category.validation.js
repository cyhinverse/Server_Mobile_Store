import joi from 'joi';

export const ValidationCategory = {
	createCategory: joi.object({
		name: joi.string().trim().min(2).max(100).required().messages({
			'string.empty': 'Name is required',
			'string.min': 'Name must be at least 2 characters',
			'string.max': 'Name must not exceed 100 characters',
			'any.required': 'Name is required',
		}),
		slug: joi
			.string()
			.trim()
			.min(2)
			.max(100)
			.pattern(/^[a-z0-9-]+$/)
			.required()
			.messages({
				'string.empty': 'Slug is required',
				'string.min': 'Slug must be at least 2 characters',
				'string.max': 'Slug must not exceed 100 characters',
				'string.pattern.base':
					'Slug must only contain lowercase letters, numbers, and hyphens',
				'any.required': 'Slug is required',
			}),
		parentId: joi
			.string()
			.hex()
			.length(24)
			.optional()
			.allow(null, '')
			.messages({
				'string.hex': 'Parent ID must be a valid ObjectId',
				'string.length': 'Parent ID must be exactly 24 characters',
			}),
		description: joi.string().trim().min(10).max(500).required().messages({
			'string.empty': 'Description is required',
			'string.min': 'Description must be at least 10 characters',
			'string.max': 'Description must not exceed 500 characters',
			'any.required': 'Description is required',
		}),
	}),

	updateCategory: joi.object({
		name: joi.string().trim().min(2).max(100).optional().messages({
			'string.min': 'Name must be at least 2 characters',
			'string.max': 'Name must not exceed 100 characters',
		}),
		slug: joi
			.string()
			.trim()
			.min(2)
			.max(100)
			.pattern(/^[a-z0-9-]+$/)
			.optional()
			.messages({
				'string.min': 'Slug must be at least 2 characters',
				'string.max': 'Slug must not exceed 100 characters',
				'string.pattern.base':
					'Slug must only contain lowercase letters, numbers, and hyphens',
			}),
		parentId: joi
			.string()
			.hex()
			.length(24)
			.optional()
			.allow(null, '')
			.messages({
				'string.hex': 'Parent ID must be a valid ObjectId',
				'string.length': 'Parent ID must be exactly 24 characters',
			}),
		description: joi.string().trim().min(10).max(500).optional().messages({
			'string.min': 'Description must be at least 10 characters',
			'string.max': 'Description must not exceed 500 characters',
		}),
	}),

	getCategoryById: joi.object({
		id: joi.string().hex().length(24).required().messages({
			'string.empty': 'Category ID is required',
			'string.hex': 'Category ID must be a valid ObjectId',
			'string.length': 'Category ID must be exactly 24 characters',
			'any.required': 'Category ID is required',
		}),
	}),

	getCategoryBySlug: joi.object({
		slug: joi.string().trim().required().messages({
			'string.empty': 'Slug is required',
			'any.required': 'Slug is required',
		}),
	}),

	deleteCategory: joi.object({
		id: joi.string().hex().length(24).required().messages({
			'string.empty': 'Category ID is required',
			'string.hex': 'Category ID must be a valid ObjectId',
			'string.length': 'Category ID must be exactly 24 characters',
			'any.required': 'Category ID is required',
		}),
	}),

	getCategoriesPaginated: joi.object({
		page: joi
			.number()
			.integer()
			.min(1)
			.max(1000)
			.optional()
			.default(1)
			.messages({
				'number.base': 'Page must be a number',
				'number.integer': 'Page must be an integer',
				'number.min': 'Page must be at least 1',
				'number.max': 'Page must not exceed 1000',
			}),
		limit: joi
			.number()
			.integer()
			.min(1)
			.max(100)
			.optional()
			.default(10)
			.messages({
				'number.base': 'Limit must be a number',
				'number.integer': 'Limit must be an integer',
				'number.min': 'Limit must be at least 1',
				'number.max': 'Limit must not exceed 100',
			}),
		search: joi.string().trim().max(100).allow('', null).optional().messages({
			'string.base': 'Search must be a string',
			'string.max': 'Search must not exceed 100 characters',
		}),
	}),

	getChildrenCategories: joi.object({
		parentId: joi.string().hex().length(24).required().messages({
			'string.empty': 'Parent ID is required',
			'string.hex': 'Parent ID must be a valid ObjectId',
			'string.length': 'Parent ID must be exactly 24 characters',
			'any.required': 'Parent ID is required',
		}),
		page: joi
			.number()
			.integer()
			.min(1)
			.max(1000)
			.optional()
			.default(1)
			.messages({
				'number.base': 'Page must be a number',
				'number.integer': 'Page must be an integer',
				'number.min': 'Page must be at least 1',
				'number.max': 'Page must not exceed 1000',
			}),
		limit: joi
			.number()
			.integer()
			.min(1)
			.max(100)
			.optional()
			.default(10)
			.messages({
				'number.base': 'Limit must be a number',
				'number.integer': 'Limit must be an integer',
				'number.min': 'Limit must be at least 1',
				'number.max': 'Limit must not exceed 100',
			}),
	}),
};
