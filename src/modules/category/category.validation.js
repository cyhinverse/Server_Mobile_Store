import joi from 'joi';

export const ValidationCategory = {
	createCategory: joi.object({
		name: joi.string().required().messages({
			'string.empty': 'Name is required',
			'any.required': 'Name is required',
		}),
		parentId: joi.string().optional().messages({
			'string.empty': 'Parent ID must be a valid string',
			'any.required': 'Parent ID is optional',
		}),
		description: joi.string().optional().messages({
			'string.empty': 'Description must be a valid string',
		}),
	}),
	deleteCategory: joi.object({
		id: joi.string().required().message('Category ID is required'),
	}),
	updateCategory: joi.object({
		id: joi.string().required().message('Category ID is required'),
		name: joi.string().optional().message('Name must be a valid string'),
		parentId: joi
			.string()
			.optional()
			.message('Parent ID must be a valid string'),
		description: joi
			.string()
			.optional()
			.message('Description must be a valid string'),
	}),
};
