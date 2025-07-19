import joi from 'joi';

export const ValidationAddress = {
	createAddress: joi.object({
		user: joi.string().required().messages({
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		fullName: joi.string().required().messages({
			'string.empty': 'Full name is required',
			'any.required': 'Full name is required',
		}),
		phoneNumber: joi
			.string()
			.required()
			.pattern(/^[0-9]{10,11}$/)
			.messages({
				'string.empty': 'Phone number is required',
				'any.required': 'Phone number is required',
				'string.pattern.base': 'Phone number must be 10-11 digits',
			}),
		province: joi.string().required().messages({
			'string.empty': 'Province is required',
			'any.required': 'Province is required',
		}),
		district: joi.string().required().messages({
			'string.empty': 'District is required',
			'any.required': 'District is required',
		}),
		ward: joi.string().required().messages({
			'string.empty': 'Ward is required',
			'any.required': 'Ward is required',
		}),
		street: joi.string().required().messages({
			'string.empty': 'Street is required',
			'any.required': 'Street is required',
		}),
		isDefault: joi.boolean().optional().messages({
			'boolean.base': 'isDefault must be a boolean value',
		}),
		note: joi.string().optional().allow('').messages({
			'string.base': 'Note must be a valid string',
		}),
	}),

	deleteAddress: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
	}),

	updateAddress: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
		fullName: joi.string().optional().messages({
			'string.empty': 'Full name must be a valid string',
		}),
		phoneNumber: joi
			.string()
			.optional()
			.pattern(/^[0-9]{10,11}$/)
			.messages({
				'string.pattern.base': 'Phone number must be 10-11 digits',
			}),
		province: joi.string().optional().messages({
			'string.empty': 'Province must be a valid string',
		}),
		district: joi.string().optional().messages({
			'string.empty': 'District must be a valid string',
		}),
		ward: joi.string().optional().messages({
			'string.empty': 'Ward must be a valid string',
		}),
		street: joi.string().optional().messages({
			'string.empty': 'Street must be a valid string',
		}),
		isDefault: joi.boolean().optional().messages({
			'boolean.base': 'isDefault must be a boolean value',
		}),
		note: joi.string().optional().allow('').messages({
			'string.base': 'Note must be a valid string',
		}),
	}),

	getAddressById: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
	}),

	getAddressesByUser: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
	}),

	setDefaultAddress: joi.object({
		id: joi.string().required().messages({
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
	}),

	getAddressesPaginated: joi.object({
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
		userId: joi.string().optional().messages({
			'string.base': 'User ID must be a string',
		}),
	}),
};
