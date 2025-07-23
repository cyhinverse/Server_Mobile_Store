import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import cartService from './cart.service.js';
import CartValidation from './cart.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';
class CartController {
	constructor() {
		this.cartService = cartService;
	}
	createCart = catchAsync(async (req, res) => {
		const { userId, productId, quantity } = req.body;
		if (!userId || !productId || !quantity) {
			return formatFail({
				res,
				message: 'User ID, Product ID, and Quantity are required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		let _CartValidation = CartValidation.createCart;
		const { error } = _CartValidation.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const cart = await cartService.createCart({
			userId,
			productId,
			quantity,
		});
		if (cart === null || !cart) {
			return formatError({
				res,
				message: 'Cart could not be created!',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			data: cart,
			message: 'Cart created successfully!',
			code: StatusCodes.CREATED,
		});
	});
	deleteCart = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;
		if (!userId || !productId) {
			return formatFail({
				res,
				message: 'User ID and Product ID are required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const _CartValidation = CartValidation.deleteCart;
		const { error } = _CartValidation.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const cart = await cartService.deleteCart({
			userId,
			productId,
		});
		if (cart === null || !cart) {
			return formatFail({
				res,
				message: 'Cart not found or could not be deleted!',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: cart,
			message: 'Cart deleted successfully!',
			code: StatusCodes.OK,
		});
	});
	updateCart = catchAsync(async (req, res) => {
		const { userId, productId, quantity } = req.body;
		if (!userId || !productId || !quantity) {
			return formatFail({
				res,
				message: 'User ID, Product ID, and Quantity are required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const _CartValidation = CartValidation.createCart;
		const { error } = _CartValidation.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const cart = await cartService.updateCart({
			userId,
			productId,
			quantity,
		});
		if (cart === null || !cart) {
			return formatFail({
				res,
				message: 'Cart not found or could not be updated!',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: cart,
			message: 'Cart updated successfully!',
			code: StatusCodes.OK,
		});
	});
	getCart = catchAsync(async (req, res) => {
		const { userId } = req.params;
		if (!userId || userId === undefined) {
			return formatFail({
				res,
				message: 'User ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const cartItems = await cartService.getCartByUserId(userId);
		if (cartItems === null || !cartItems) {
			return formatFail({
				res,
				message: 'Cart not found or could not be retrieved!',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: cartItems,
			message: 'Cart retrieved successfully!',
			code: StatusCodes.OK,
		});
	});
	clearCart = catchAsync(async (req, res) => {
		const { userId } = req.params;
		if (!userId || userId === undefined) {
			return formatFail({
				res,
				message: 'User ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const cartItems = await cartService.clearCartByUserId(userId);
		if (cartItems === null || !cartItems) {
			return formatFail({
				res,
				message: 'Cart not found or could not be cleared!',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: cartItems,
			message: 'Cart cleared successfully!',
			code: StatusCodes.OK,
		});
	});
	addMultipleItemsToCart = catchAsync(async (req, res) => {});
}

export default new CartController();
