import joi from 'joi';

const CartValidation = {
	createCart: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required!',
			'any.required': 'User ID is required!',
		}),
		productId: joi.string().required().messages({
			'string.empty': 'Product ID is required!',
			'any.required': 'Product ID is required!',
		}),
		quantity: joi.number().integer().min(1).required().messages({
			'number.base': 'Quantity must be a number!',
			'number.integer': 'Quantity must be an integer!',
			'number.min': 'Quantity must be at least 1!',
			'any.required': 'Quantity is required!',
		}),
	}),
	deleteCart: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required!',
			'any.required': 'User ID is required!',
		}),
		productId: joi.string().required().messages({
			'string.empty': 'Product ID is required!',
			'any.required': 'Product ID is required!',
		}),
	}),
	updateCart: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required!',
			'any.required': 'User ID is required!',
		}),
		productId: joi.string().required().messages({
			'string.empty': 'Product ID is required!',
			'any.required': 'Product ID is required!',
		}),
		quantity: joi.number().integer().min(1).required().messages({
			'number.base': 'Quantity must be a number!',
			'number.integer': 'Quantity must be an integer!',
			'number.min': 'Quantity must be at least 1!',
			'any.required': 'Quantity is required!',
		}),
	}),
	getCart: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required!',
			'any.required': 'User ID is required!',
		}),
	}),
	clearCart: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required!',
			'any.required': 'User ID is required!',
		}),
	}),
	getCartItemById: joi.object({
		userId: joi.string().required().messages({
			'string.empty': 'User ID is required!',
			'any.required': 'User ID is required!',
		}),
		productId: joi.string().required().messages({
			'string.empty': 'Product ID is required!',
			'any.required': 'Product ID is required!',
		}),
	}),
};

export default CartValidation;
