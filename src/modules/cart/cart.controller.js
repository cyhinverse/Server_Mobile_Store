import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import cartService from './cart.service.js';
import CartValidation from './cart.validation.js';
import chalk from 'chalk';
class CartController {
	constructor() {
		this.cartService = cartService;
	}
	createCart = catchAsync(async (req, res) => {
		const { userId, productId, quantity } = req.body;
		if (!userId || !productId || !quantity) {
			return res.status(400).json({
				message: chalk.red('User ID, Product ID, and Quantity are required!'),
			});
		}
		let _CartValidation = CartValidation.createCart;
		const { error } = _CartValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const cart = await cartService.createCart({
			userId,
			productId,
			quantity,
		});
		if (cart === null || !cart) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Cart could not be created!'),
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: chalk.green('Cart created successfully!'),
		});
	});
	deleteCart = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;
		if (!userId || !productId) {
			return res.status(400).json({
				message: chalk.red('User ID and Product ID are required!'),
			});
		}
		const _CartValidation = CartValidation.deleteCart;
		const { error } = _CartValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const cart = await cartService.deleteCart({
			userId,
			productId,
		});
		if (cart === null || !cart) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Cart not found or could not be deleted!'),
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Cart deleted successfully!'),
		});
	});
	updateCart = catchAsync(async (req, res) => {
		const { userId, productId, quantity } = req.body;
		if (!userId || !productId || !quantity) {
			return res.status(400).json({
				message: chalk.red('User ID, Product ID, and Quantity are required!'),
			});
		}
		const _CartValidation = CartValidation.createCart;
		const { error } = _CartValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
			});
		}
		const cart = await cartService.updateCart({
			userId,
			productId,
			quantity,
		});
		if (cart === null || !cart) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Cart not found or could not be updated!'),
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Cart updated successfully!'),
		});
	});
	getCart = catchAsync(async (req, res) => {
		const { userId } = req.params;
		if (!userId || userId === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('User ID is required!'),
			});
		}
		const cartItems = await cartService.getCartByUserId(userId);
		if (cartItems === null || !cartItems) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Cart not found or could not be retrieved!'),
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Cart retrieved successfully!'),
			data: cartItems,
		});
	});
	clearCart = catchAsync(async (req, res) => {
		const { userId } = req.params;
		if (!userId || userId === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('User ID is required!'),
			});
		}
		const cartItems = await cartService.clearCartByUserId(userId);
		if (cartItems === null || !cartItems) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Cart not found or could not be cleared!'),
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Cart cleared successfully!'),
			data: cartItems,
		});
	});
	addMultipleItemsToCart = catchAsync(async (req, res) => {});
}

export default new CartController();
