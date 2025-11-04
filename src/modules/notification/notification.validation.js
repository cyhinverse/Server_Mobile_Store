import joi from 'joi';

const NotificationValidation = {
	// Query validation for getting notifications
	queryNotification: joi.object({
		page: joi.number().integer().min(1).optional().messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),
		limit: joi.number().integer().min(1).max(100).optional().messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit cannot exceed 100',
		}),
		status: joi
			.string()
			.valid('unread', 'read', 'deleted')
			.optional()
			.messages({
				'any.only': 'Status must be one of: unread, read, deleted',
			}),
		type: joi
			.string()
			.valid('order', 'promotion', 'system', 'account', 'delivery')
			.optional()
			.messages({
				'any.only':
					'Type must be one of: order, promotion, system, account, delivery',
			}),
		sort: joi
			.string()
			.valid('newest', 'oldest', 'priority', 'type')
			.optional()
			.messages({
				'any.only': 'Sort must be one of: newest, oldest, priority, type',
			}),
	}),

	// Validation for notification ID parameter
	notificationId: joi.object({
		id: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'Notification ID is required',
				'string.pattern.base': 'Invalid notification ID format',
				'any.required': 'Notification ID is required',
			}),
	}),

	// Validation for notification type parameter
	notificationType: joi.object({
		type: joi
			.string()
			.valid('order', 'promotion', 'system', 'account', 'delivery')
			.required()
			.messages({
				'string.empty': 'Notification type is required',
				'any.required': 'Notification type is required',
				'any.only':
					'Type must be one of: order, promotion, system, account, delivery',
			}),
	}),

	// Validation for creating notification
	createNotification: joi.object({
		userId: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'User ID is required',
				'string.pattern.base': 'Invalid user ID format',
				'any.required': 'User ID is required',
			}),
		type: joi
			.string()
			.valid('order', 'promotion', 'system', 'account', 'delivery')
			.required()
			.messages({
				'string.empty': 'Type is required',
				'any.required': 'Type is required',
				'any.only':
					'Type must be one of: order, promotion, system, account, delivery',
			}),
		title: joi
			.alternatives()
			.try(
				joi.string().min(1).max(200),
				joi.object({
					vi: joi.string().min(1).max(200).required(),
					en: joi.string().min(1).max(200).optional(),
				})
			)
			.required()
			.messages({
				'alternatives.match':
					'Title must be a string or object with vi/en properties',
				'any.required': 'Title is required',
			}),
		content: joi
			.alternatives()
			.try(
				joi.string().min(1).max(1000),
				joi.object({
					vi: joi.string().min(1).max(1000).required(),
					en: joi.string().min(1).max(1000).optional(),
				})
			)
			.required()
			.messages({
				'alternatives.match':
					'Content must be a string or object with vi/en properties',
				'any.required': 'Content is required',
			}),
		metadata: joi.object().optional(),
		priority: joi.string().valid('high', 'medium', 'low').optional().messages({
			'any.only': 'Priority must be one of: high, medium, low',
		}),
		scheduledAt: joi.date().iso().optional().messages({
			'date.base': 'Scheduled date must be a valid date',
			'date.format': 'Scheduled date must be in ISO format',
		}),
		expiresAt: joi.date().iso().optional().messages({
			'date.base': 'Expiration date must be a valid date',
			'date.format': 'Expiration date must be in ISO format',
		}),
	}),

	// Validation for creating system notification
	createSystemNotification: joi.object({
		userIds: joi
			.array()
			.items(
				joi
					.string()
					.pattern(/^[0-9a-fA-F]{24}$/)
					.message('Invalid user ID format')
			)
			.min(1)
			.required()
			.messages({
				'array.base': 'User IDs must be an array',
				'array.min': 'At least one user ID is required',
				'any.required': 'User IDs are required',
			}),
		title: joi
			.alternatives()
			.try(
				joi.string().min(1).max(200),
				joi.object({
					vi: joi.string().min(1).max(200).required(),
					en: joi.string().min(1).max(200).optional(),
				})
			)
			.required()
			.messages({
				'alternatives.match':
					'Title must be a string or object with vi/en properties',
				'any.required': 'Title is required',
			}),
		content: joi
			.alternatives()
			.try(
				joi.string().min(1).max(1000),
				joi.object({
					vi: joi.string().min(1).max(1000).required(),
					en: joi.string().min(1).max(1000).optional(),
				})
			)
			.required()
			.messages({
				'alternatives.match':
					'Content must be a string or object with vi/en properties',
				'any.required': 'Content is required',
			}),
		metadata: joi.object().optional(),
	}),

	// Validation for creating order notification
	createOrderNotification: joi.object({
		userId: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'User ID is required',
				'string.pattern.base': 'Invalid user ID format',
				'any.required': 'User ID is required',
			}),
		orderId: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'Order ID is required',
				'string.pattern.base': 'Invalid order ID format',
				'any.required': 'Order ID is required',
			}),
		orderStatus: joi
			.string()
			.valid('confirmed', 'shipped', 'delivered', 'cancelled')
			.required()
			.messages({
				'string.empty': 'Order status is required',
				'any.required': 'Order status is required',
				'any.only':
					'Order status must be one of: confirmed, shipped, delivered, cancelled',
			}),
		orderData: joi
			.object({
				orderNumber: joi.string().required().messages({
					'string.empty': 'Order number is required',
					'any.required': 'Order number is required',
				}),
				totalAmount: joi.number().optional(),
				customerName: joi.string().optional(),
			})
			.required()
			.messages({
				'any.required': 'Order data is required',
			}),
	}),

	// Validation for creating promotion notification
	createPromotionNotification: joi.object({
		userId: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'User ID is required',
				'string.pattern.base': 'Invalid user ID format',
				'any.required': 'User ID is required',
			}),
		promotionId: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'Promotion ID is required',
				'string.pattern.base': 'Invalid promotion ID format',
				'any.required': 'Promotion ID is required',
			}),
		promotionData: joi
			.object({
				title: joi.string().required().messages({
					'string.empty': 'Promotion title is required',
					'any.required': 'Promotion title is required',
				}),
				discountValue: joi.number().min(0).required().messages({
					'number.base': 'Discount value must be a number',
					'number.min': 'Discount value cannot be negative',
					'any.required': 'Discount value is required',
				}),
				endDate: joi.date().iso().optional().messages({
					'date.base': 'End date must be a valid date',
					'date.format': 'End date must be in ISO format',
				}),
			})
			.required()
			.messages({
				'any.required': 'Promotion data is required',
			}),
	}),

	// Alias for route compatibility
	getNotifications: joi.object({
		page: joi.number().integer().min(1).optional().messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),
		limit: joi.number().integer().min(1).max(100).optional().messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit cannot exceed 100',
		}),
		status: joi
			.string()
			.valid('unread', 'read', 'deleted')
			.optional()
			.messages({
				'any.only': 'Status must be one of: unread, read, deleted',
			}),
		type: joi
			.string()
			.valid('order', 'promotion', 'system', 'account', 'delivery')
			.optional()
			.messages({
				'any.only':
					'Type must be one of: order, promotion, system, account, delivery',
			}),
		sort: joi
			.string()
			.valid('newest', 'oldest', 'priority', 'type')
			.optional()
			.messages({
				'any.only': 'Sort must be one of: newest, oldest, priority, type',
			}),
	}),

	// Mongo ID validation
	mongoId: joi.object({
		id: joi
			.string()
			.pattern(/^[0-9a-fA-F]{24}$/)
			.required()
			.messages({
				'string.empty': 'ID is required',
				'string.pattern.base': 'Invalid ID format',
				'any.required': 'ID is required',
			}),
	}),
};

export default NotificationValidation;
