import joi from 'joi';

const NotificationValidation = {
	// Validation cho tạo thông báo
	createNotification: joi.object({
		user: joi.string().required().messages({
			'string.empty': 'User ID is required',
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
			.object({
				vi: joi.string().required().messages({
					'string.empty': 'Vietnamese title is required',
					'any.required': 'Vietnamese title is required',
				}),
				en: joi.string().optional().messages({
					'string.base': 'English title must be a string',
				}),
			})
			.required()
			.messages({
				'any.required': 'Title is required',
			}),
		content: joi
			.object({
				vi: joi.string().required().messages({
					'string.empty': 'Vietnamese content is required',
					'any.required': 'Vietnamese content is required',
				}),
				en: joi.string().optional().messages({
					'string.base': 'English content must be a string',
				}),
			})
			.required()
			.messages({
				'any.required': 'Content is required',
			}),
		metadata: joi
			.object({
				orderId: joi.string().optional().messages({
					'string.base': 'Order ID must be a string',
				}),
				promotionId: joi.string().optional().messages({
					'string.base': 'Promotion ID must be a string',
				}),
				deepLink: joi.string().optional().messages({
					'string.base': 'Deep link must be a string',
				}),
				icon: joi.string().optional().messages({
					'string.base': 'Icon must be a string',
				}),
			})
			.optional(),
		priority: joi
			.string()
			.valid('high', 'medium', 'low')
			.default('medium')
			.messages({
				'any.only': 'Priority must be one of: high, medium, low',
			}),
		expiresAt: joi.date().optional().messages({
			'date.base': 'Expires at must be a valid date',
		}),
		imageUrl: joi.string().uri().optional().messages({
			'string.uri': 'Image URL must be a valid URI',
		}),
	}),

	// Validation cho tạo thông báo hệ thống
	createSystemNotification: joi.object({
		userIds: joi
			.array()
			.items(joi.string().required())
			.min(1)
			.required()
			.messages({
				'array.base': 'User IDs must be an array',
				'array.min': 'At least one user ID is required',
				'any.required': 'User IDs are required',
			}),
		title: joi
			.object({
				vi: joi.string().required().messages({
					'string.empty': 'Vietnamese title is required',
					'any.required': 'Vietnamese title is required',
				}),
				en: joi.string().optional().messages({
					'string.base': 'English title must be a string',
				}),
			})
			.required()
			.messages({
				'any.required': 'Title is required',
			}),
		content: joi
			.object({
				vi: joi.string().required().messages({
					'string.empty': 'Vietnamese content is required',
					'any.required': 'Vietnamese content is required',
				}),
				en: joi.string().optional().messages({
					'string.base': 'English content must be a string',
				}),
			})
			.required()
			.messages({
				'any.required': 'Content is required',
			}),
		metadata: joi
			.object({
				deepLink: joi.string().optional().messages({
					'string.base': 'Deep link must be a string',
				}),
				icon: joi.string().optional().messages({
					'string.base': 'Icon must be a string',
				}),
			})
			.optional(),
	}),

	// Validation cho tạo thông báo đơn hàng
	createOrderNotification: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		orderId: joi.string().required().messages({
			'string.empty': 'Order ID is required',
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
				totalAmount: joi.number().optional().messages({
					'number.base': 'Total amount must be a number',
				}),
			})
			.required()
			.messages({
				'any.required': 'Order data is required',
			}),
	}),

	// Validation cho tạo thông báo khuyến mãi
	createPromotionNotification: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required',
			'any.required': 'User ID is required',
		}),
		promotionId: joi.string().required().messages({
			'string.empty': 'Promotion ID is required',
			'any.required': 'Promotion ID is required',
		}),
		promotionData: joi
			.object({
				title: joi.string().required().messages({
					'string.empty': 'Promotion title is required',
					'any.required': 'Promotion title is required',
				}),
				discountValue: joi.number().required().messages({
					'number.base': 'Discount value must be a number',
					'any.required': 'Discount value is required',
				}),
				endDate: joi.date().optional().messages({
					'date.base': 'End date must be a valid date',
				}),
			})
			.required()
			.messages({
				'any.required': 'Promotion data is required',
			}),
	}),

	// Validation cho query parameters
	getNotifications: joi.object({
		page: joi.number().integer().min(1).default(1).messages({
			'number.base': 'Page must be a number',
			'number.integer': 'Page must be an integer',
			'number.min': 'Page must be at least 1',
		}),
		limit: joi.number().integer().min(1).max(100).default(20).messages({
			'number.base': 'Limit must be a number',
			'number.integer': 'Limit must be an integer',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit must be at most 100',
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
		sort: joi.string().optional().messages({
			'string.base': 'Sort must be a string',
		}),
	}),

	// Validation cho MongoDB ObjectId
	mongoId: joi
		.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
			'any.required': 'ID is required',
		}),
};

export default NotificationValidation;
