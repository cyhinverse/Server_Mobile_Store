import Joi from 'joi';

// ObjectId validation pattern
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const UserValidation = {
	/**
	 * Create user validation
	 */
	createUserValidation: Joi.object({
		fullName: Joi.string().required().trim().min(2).max(100).messages({
			'string.empty': 'Full name is required',
			'string.min': 'Full name must be at least 2 characters',
			'string.max': 'Full name must not exceed 100 characters',
			'any.required': 'Full name is required',
		}),
		email: Joi.string().email().required().messages({
			'string.email': 'Please provide a valid email address',
			'string.empty': 'Email is required',
			'any.required': 'Email is required',
		}),
		password: Joi.string().min(6).max(128).required().messages({
			'string.min': 'Password must be at least 6 characters',
			'string.max': 'Password must not exceed 128 characters',
			'string.empty': 'Password is required',
			'any.required': 'Password is required',
		}),
		roles: Joi.string()
			.valid('user', 'admin', 'staff')
			.optional()
			.default('user')
			.messages({
				'any.only': 'Role must be one of: user, admin, staff',
			}),
		phoneNumber: Joi.string()
			.pattern(/^[0-9]{10,11}$/)
			.optional()
			.messages({
				'string.pattern.base': 'Phone number must be 10-11 digits',
			}),
		address: Joi.array().optional(),
	}),

	/**
	 * Get users paginated validation
	 */
	getUsersPaginatedValidation: Joi.object({
		page: Joi.number().integer().min(1).default(1),
		limit: Joi.number().integer().min(1).max(100).default(10),
		search: Joi.string().allow(''),
		role: Joi.string().allow(''),
	}).options({ convert: true }),

	/**
	 * Get user by ID validation
	 */
	getUserByIdValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
	}),

	/**
	 * Update user validation
	 */
	updateUserValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		fullName: Joi.string().trim().min(2).max(100).optional().messages({
			'string.min': 'Full name must be at least 2 characters',
			'string.max': 'Full name must not exceed 100 characters',
		}),
		email: Joi.string().email().optional().messages({
			'string.email': 'Please provide a valid email address',
		}),
		roles: Joi.string().valid('user', 'admin', 'staff').optional().messages({
			'any.only': 'Role must be one of: user, admin, staff',
		}),
		phoneNumber: Joi.string()
			.pattern(/^[0-9]{10,11}$/)
			.optional()
			.messages({
				'string.pattern.base': 'Phone number must be 10-11 digits',
			}),
		isActive: Joi.boolean().optional().messages({
			'boolean.base': 'isActive must be a boolean value',
		}),
	}),

	/**
	 * Delete user validation
	 */
	deleteUserValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
	}),

	/**
	 * Add address validation
	 */
	addAddressValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		fullName: Joi.string().required().trim().min(2).max(100).messages({
			'string.empty': 'Full name is required',
			'string.min': 'Full name must be at least 2 characters',
			'string.max': 'Full name must not exceed 100 characters',
			'any.required': 'Full name is required',
		}),
		phoneNumber: Joi.string()
			.required()
			.pattern(/^[0-9]{10,11}$/)
			.messages({
				'string.empty': 'Phone number is required',
				'any.required': 'Phone number is required',
				'string.pattern.base': 'Phone number must be 10-11 digits',
			}),
		province: Joi.string().required().trim().messages({
			'string.empty': 'Province is required',
			'any.required': 'Province is required',
		}),
		district: Joi.string().required().trim().messages({
			'string.empty': 'District is required',
			'any.required': 'District is required',
		}),
		ward: Joi.string().required().trim().messages({
			'string.empty': 'Ward is required',
			'any.required': 'Ward is required',
		}),
		street: Joi.string().required().trim().messages({
			'string.empty': 'Street is required',
			'any.required': 'Street is required',
		}),
		isDefault: Joi.boolean().optional().default(false).messages({
			'boolean.base': 'isDefault must be a boolean value',
		}),
		note: Joi.string().optional().allow('').max(500).messages({
			'string.base': 'Note must be a valid string',
			'string.max': 'Note must not exceed 500 characters',
		}),
	}),

	/**
	 * Update address validation
	 */
	updateAddressValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		addressId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid address ID format',
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
		fullName: Joi.string().trim().min(2).max(100).optional().messages({
			'string.min': 'Full name must be at least 2 characters',
			'string.max': 'Full name must not exceed 100 characters',
		}),
		phoneNumber: Joi.string()
			.pattern(/^[0-9]{10,11}$/)
			.optional()
			.messages({
				'string.pattern.base': 'Phone number must be 10-11 digits',
			}),
		province: Joi.string().trim().optional().messages({
			'string.empty': 'Province must be a valid string',
		}),
		district: Joi.string().trim().optional().messages({
			'string.empty': 'District must be a valid string',
		}),
		ward: Joi.string().trim().optional().messages({
			'string.empty': 'Ward must be a valid string',
		}),
		street: Joi.string().trim().optional().messages({
			'string.empty': 'Street must be a valid string',
		}),
		isDefault: Joi.boolean().optional().messages({
			'boolean.base': 'isDefault must be a boolean value',
		}),
		note: Joi.string().optional().allow('').max(500).messages({
			'string.base': 'Note must be a valid string',
			'string.max': 'Note must not exceed 500 characters',
		}),
	}),

	/**
	 * Delete address validation
	 */
	deleteAddressValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		addressId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid address ID format',
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
	}),

	/**
	 * Set default address validation
	 */
	setDefaultAddressValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		addressId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid address ID format',
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
	}),

	/**
	 * Get user addresses validation
	 */
	getUserAddressesValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
	}),

	/**
	 * Get address by ID validation
	 */
	getAddressByIdValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		addressId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid address ID format',
			'string.empty': 'Address ID is required',
			'any.required': 'Address ID is required',
		}),
	}),

	/**
	 * Get default address validation
	 */
	getDefaultAddressValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
	}),

	/**
	 * Get addresses paginated validation
	 */
	getAddressesPaginatedValidation: Joi.object({
		page: Joi.number().integer().min(1).optional().default(1).messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),
		limit: Joi.number()
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

	/**
	 * Count addresses by user validation
	 */
	countAddressesByUserValidation: Joi.object({
		userId: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Invalid user ID format',
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
	}),
};

export default UserValidation;
