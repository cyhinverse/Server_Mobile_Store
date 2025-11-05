import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import cartService from './cart.service.js';
import { ValidationCart } from './cart.validation.js';
import {
	formatSuccess,
	formatFail,
} from '../../shared/response/responseFormatter.js';
import BaseController from '../../core/controller/base.controller.js';

class CartController extends BaseController {
	constructor() {
		super(cartService);
	}

	/**
	 * Add item to cart
	 * POST /api/carts
	 */
	addToCart = catchAsync(async (req, res) => {
		const userId = req.user.id;
		const {
			productId,
			quantity,
			variantId,
			variantSku,
			price,
			variantColor,
			variantStorage,
		} = req.body;

		// Validate only the request body (not userId from token)
		const { error, value } = ValidationCart.addToCart.validate(
			{
				productId,
				quantity,
				variantId,
				variantSku,
				price,
				variantColor,
				variantStorage,
			},
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		// Prepare cart data with optional variant info
		const cartData = {
			productId,
			quantity,
			...(variantId && { variantId }),
			...(variantSku && { variantSku }),
			...(price && { price }),
			...(variantColor && { variantColor }),
			...(variantStorage && { variantStorage }),
		};

		const cartItem = await cartService.addToCart(userId, cartData);

		if (!cartItem || cartItem === null) {
			return formatFail({
				res,
				message: 'Add product to cart failed!',
				code: 400,
				errorCode: '400',
			});
		}

		return formatSuccess({
			res,
			data: cartItem,
			message: 'Item added to cart successfully',
			code: StatusCodes.CREATED,
		});
	});

	/**
	 * Get cart items for user
	 * GET /api/carts/user/:userId
	 */
	getCartByUserId = catchAsync(async (req, res) => {
		const { userId } = req.params;

		const cartItems = await cartService.getCartByUserId(userId);

		return formatSuccess({
			res,
			data: cartItems,
			message: 'Cart items retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get carts with pagination
	 * GET /api/carts/paginated
	 */
	getCartsPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, userId, search = '' } = req.query;

		const paginationData = await cartService.getCartsPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
			userId,
			search,
		});

		return formatSuccess({
			res,
			data: paginationData.cartItems,
			message: 'Cart items retrieved with pagination successfully',
			code: StatusCodes.OK,
			meta: {
				pagination: {
					page: paginationData.page,
					pageSize: paginationData.pageSize,
					totalItems: paginationData.totalItems,
					totalPages: paginationData.totalPages,
					hasNextPage: paginationData.hasNextPage,
					hasPrevPage: paginationData.hasPrevPage,
				},
			},
		});
	});

	/**
	 * Update cart item quantity
	 * PUT /api/carts/quantity
	 */
	updateCartQuantity = catchAsync(async (req, res) => {
		const { error } = ValidationCart.updateQuantity.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const userId = req.user.id;
		const { productId, quantity, variantSku } = req.body;

		const cartItem = await cartService.updateCartQuantity(
			userId,
			productId,
			quantity,
			variantSku
		);

		return formatSuccess({
			res,
			data: cartItem,
			message: 'Cart quantity updated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Remove item from cart
	 * DELETE /api/carts/item
	 */
	removeFromCart = catchAsync(async (req, res) => {
		const { error } = ValidationCart.removeFromCart.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const userId = req.user.id;
		const { productId, variantSku } = req.body;

		const result = await cartService.removeFromCart(
			userId,
			productId,
			variantSku
		);

		return formatSuccess({
			res,
			data: result,
			message: 'Item removed from cart successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Clear entire cart for user
	 * DELETE /api/carts/clear/:userId
	 */
	clearCart = catchAsync(async (req, res) => {
		const { userId } = req.params;

		const result = await cartService.clearCart(userId);

		return formatSuccess({
			res,
			data: { deletedCount: result.deletedCount },
			message: 'Cart cleared successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Bulk remove items from cart
	 * DELETE /api/carts/bulk/remove
	 */
	bulkRemoveFromCart = catchAsync(async (req, res) => {
		const { error } = ValidationCart.bulkRemove.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const { userId, productIds } = req.body;
		const result = await cartService.bulkRemoveFromCart(userId, productIds);

		return formatSuccess({
			res,
			data: { deletedCount: result.deletedCount },
			message: 'Items removed from cart successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get cart total for user
	 * GET /api/carts/total/:userId
	 */
	getCartTotal = catchAsync(async (req, res) => {
		const { userId } = req.params;

		const total = await cartService.getCartTotal(userId);

		return formatSuccess({
			res,
			data: total,
			message: 'Cart total retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Check if product exists in cart
	 * GET /api/carts/check/:userId/:productId
	 */
	checkProductInCart = catchAsync(async (req, res) => {
		const { userId, productId } = req.params;

		const exists = await cartService.checkProductInCart(userId, productId);

		return formatSuccess({
			res,
			data: { exists },
			message: 'Product check completed',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Decrease quantity from cart
	 * PATCH /api/carts/decrease
	 */
	decreaseQuantity = catchAsync(async (req, res) => {
		const { error } = ValidationCart.decreaseQuantity.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const { userId, productId, decreaseBy } = req.body;
		const result = await cartService.decreaseQuantity(
			userId,
			productId,
			decreaseBy
		);

		return formatSuccess({
			res,
			data: result,
			message: 'Cart quantity decreased successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get cart statistics
	 * GET /api/carts/stats
	 */
	getCartStats = catchAsync(async (req, res) => {
		const stats = await cartService.getCartStats();

		return formatSuccess({
			res,
			data: stats,
			message: 'Cart statistics retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get abandoned carts
	 * GET /api/carts/abandoned
	 */
	getAbandonedCarts = catchAsync(async (req, res) => {
		const { days = 7 } = req.query;

		const abandonedCarts = await cartService.getAbandonedCarts(parseInt(days));

		return formatSuccess({
			res,
			data: abandonedCarts,
			message: 'Abandoned carts retrieved successfully',
			code: StatusCodes.OK,
		});
	});
}

export default new CartController();
