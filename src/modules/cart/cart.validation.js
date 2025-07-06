import joi from 'joi';

const CartValidation = {
	createCart: joi.object({
		userId: joi.string().required().message({
			'string.empty': 'User ID is required!',
		}),
		productId: joi.string().required().message({
			'string.empty': 'Product ID is required!',
		}),
		quantity: joi.number().integer().min(1).required().message({
			'number.base': 'Quantity must be a number!',
			'number.min': 'Quantity must be at least 1!',
			'number.empty': 'Quantity is required!',
		}),
	}),
	deleteCart: joi.object({
		userId: joi.string().required().message({
			'string.empty': 'User ID is required!',
		}),
		productId: joi.string().required().message({
			'string.empty': 'Product ID is required!',
		}),
	}),
	updateCart: joi.object({
		userId: joi.string().required().message({
			'string.empty': 'User ID is required!',
		}),
		productId: joi.string().required().message({
			'string.empty': 'Product ID is required!',
		}),
		quantity: joi.number().integer().min(1).required().message({
			'number.base': 'Quantity must be a number!',
			'number.min': 'Quantity must be at least 1!',
			'number.empty': 'Quantity is required!',
		}),
	}),
	getCart: joi.object({
		userId: joi.string().required().message({
			'string.empty': 'User ID is required!',
		}),
	}),
	clearCart: joi.object({
		userId: joi.string().required().message({
			'string.empty': 'User ID is required!',
		}),
	}),
	getCartItemById: joi.object({
		userId: joi.string().required().message({
			'string.empty': 'User ID is required!',
		}),
		productId: joi.string().required().message({
			'string.empty': 'Product ID is required!',
		}),
	}),
};

export default CartValidation;
