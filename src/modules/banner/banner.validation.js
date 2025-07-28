import Joi from 'joi';

// MongoDB ObjectId validation pattern
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const ValidationBanner = {
	/**
	 * Validation for creating a new banner
	 */
	createBanner: Joi.object({
		imageUrl: Joi.string().uri().required().messages({
			'string.uri': 'Image URL must be a valid URI',
			'any.required': 'Image URL is required',
		}),

		title: Joi.string().trim().min(1).max(200).required().messages({
			'string.min': 'Title must be at least 1 character',
			'string.max': 'Title must not exceed 200 characters',
			'any.required': 'Title is required',
		}),

		type: Joi.string()
			.valid('banner', 'slider', 'popup', 'sidebar', 'header', 'footer')
			.default('banner')
			.messages({
				'any.only':
					'Type must be one of: banner, slider, popup, sidebar, header, footer',
			}),

		linkTo: Joi.string().uri().required().messages({
			'string.uri': 'Link must be a valid URI',
			'any.required': 'Link is required',
		}),

		position: Joi.number().integer().min(1).required().messages({
			'number.base': 'Position must be a number',
			'number.integer': 'Position must be an integer',
			'number.min': 'Position must be at least 1',
			'any.required': 'Position is required',
		}),

		isActive: Joi.boolean().default(true).messages({
			'boolean.base': 'Active status must be a boolean',
		}),

		startDate: Joi.date().iso().allow(null).messages({
			'date.format': 'Start date must be a valid ISO date',
		}),

		endDate: Joi.date().iso().min(Joi.ref('startDate')).allow(null).messages({
			'date.format': 'End date must be a valid ISO date',
			'date.min': 'End date must be after start date',
		}),

		description: Joi.string().trim().max(500).allow('').messages({
			'string.max': 'Description must not exceed 500 characters',
		}),
	})
		.custom((value, helpers) => {
			// Custom validation: if startDate is provided, endDate should also be provided
			if (value.startDate && !value.endDate) {
				return helpers.error('custom.endDateRequired');
			}
			if (value.endDate && !value.startDate) {
				return helpers.error('custom.startDateRequired');
			}
			return value;
		})
		.messages({
			'custom.endDateRequired':
				'End date is required when start date is provided',
			'custom.startDateRequired':
				'Start date is required when end date is provided',
		}),

	/**
	 * Validation for updating a banner
	 */
	updateBanner: Joi.object({
		imageUrl: Joi.string().uri().messages({
			'string.uri': 'Image URL must be a valid URI',
		}),

		title: Joi.string().trim().min(1).max(200).messages({
			'string.min': 'Title must be at least 1 character',
			'string.max': 'Title must not exceed 200 characters',
		}),

		type: Joi.string()
			.valid('banner', 'slider', 'popup', 'sidebar', 'header', 'footer')
			.messages({
				'any.only':
					'Type must be one of: banner, slider, popup, sidebar, header, footer',
			}),

		linkTo: Joi.string().uri().messages({
			'string.uri': 'Link must be a valid URI',
		}),

		position: Joi.number().integer().min(1).messages({
			'number.base': 'Position must be a number',
			'number.integer': 'Position must be an integer',
			'number.min': 'Position must be at least 1',
		}),

		isActive: Joi.boolean().messages({
			'boolean.base': 'Active status must be a boolean',
		}),

		startDate: Joi.date().iso().allow(null).messages({
			'date.format': 'Start date must be a valid ISO date',
		}),

		endDate: Joi.date().iso().allow(null).messages({
			'date.format': 'End date must be a valid ISO date',
		}),

		description: Joi.string().trim().max(500).allow('').messages({
			'string.max': 'Description must not exceed 500 characters',
		}),
	})
		.min(1)
		.messages({
			'object.min': 'At least one field must be provided for update',
		}),

	/**
	 * Validation for banner position update
	 */
	updatePosition: Joi.object({
		position: Joi.number().integer().min(1).required().messages({
			'number.base': 'Position must be a number',
			'number.integer': 'Position must be an integer',
			'number.min': 'Position must be at least 1',
			'any.required': 'Position is required',
		}),
	}),

	/**
	 * Validation for bulk status update
	 */
	bulkUpdateStatus: Joi.object({
		ids: Joi.array()
			.items(
				Joi.string().pattern(objectIdPattern).messages({
					'string.pattern.base': 'Each ID must be a valid MongoDB ObjectId',
				})
			)
			.min(1)
			.required()
			.messages({
				'array.min': 'At least one banner ID is required',
				'any.required': 'Banner IDs are required',
			}),

		isActive: Joi.boolean().required().messages({
			'boolean.base': 'Active status must be a boolean',
			'any.required': 'Active status is required',
		}),
	}),

	/**
	 * Validation for reorder banners
	 */
	reorderBanners: Joi.object({
		bannerIDs: Joi.array()
			.items(
				Joi.string().pattern(objectIdPattern).messages({
					'string.pattern.base':
						'Each banner ID must be a valid MongoDB ObjectId',
				})
			)
			.min(1)
			.required()
			.messages({
				'array.min': 'At least one banner ID is required',
				'any.required': 'Banner IDs are required',
			}),
	}),

	/**
	 * Validation for banner ID parameter
	 */
	bannerId: Joi.object({
		id: Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Banner ID must be a valid MongoDB ObjectId',
			'any.required': 'Banner ID is required',
		}),
	}),

	/**
	 * Validation for pagination query parameters
	 */
	paginationQuery: Joi.object({
		page: Joi.number().integer().min(1).default(1).messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),

		limit: Joi.number().integer().min(1).max(100).default(10).messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit must not exceed 100',
		}),

		search: Joi.string().trim().allow('').max(100).messages({
			'string.max': 'Search term must not exceed 100 characters',
		}),

		type: Joi.string()
			.valid('banner', 'slider', 'popup', 'sidebar', 'header', 'footer')
			.allow('')
			.messages({
				'any.only':
					'Type must be one of: banner, slider, popup, sidebar, header, footer',
			}),

		isActive: Joi.string().valid('true', 'false').allow('').messages({
			'any.only': 'Active filter must be true or false',
		}),
	}),

	/**
	 * Validation for date range query
	 */
	dateRangeQuery: Joi.object({
		startDate: Joi.date().iso().required().messages({
			'date.format': 'Start date must be a valid ISO date',
			'any.required': 'Start date is required',
		}),

		endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
			'date.format': 'End date must be a valid ISO date',
			'date.min': 'End date must be after start date',
			'any.required': 'End date is required',
		}),
	}),
};
