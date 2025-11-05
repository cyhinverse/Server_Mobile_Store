import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import WishlistService from './wishlist.service.js';
import { WishListValidation } from './wishlist.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class WishListController {
	constructor() {
		if (WishListController.instance) return WishListController.instance;
		WishListController.instance = this;
	}

	// Add product to wishlist
	addToWishlist = catchAsync(async (req, res) => {
		const { error, value } = WishListValidation.addToWishlist.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			const userId = req.user.id;
			const { productId } = value;

			const wishlist = await WishlistService.addToWishlist(userId, productId);
			return formatSuccess({
				res,
				message: 'Product added to wishlist successfully',
				code: StatusCodes.OK,
				data: wishlist,
			});
		} catch (error) {
			if (error.message.includes('already exists')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.CONFLICT,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Remove product from wishlist
	removeFromWishlist = catchAsync(async (req, res) => {
		const { productId } = req.params;

		if (!productId) {
			return formatFail({
				res,
				message: 'Product ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const userId = req.user.id;
			const wishlist = await WishlistService.removeFromWishlist(
				userId,
				productId
			);
			return formatSuccess({
				res,
				message: 'Product removed from wishlist successfully',
				code: StatusCodes.OK,
				data: wishlist,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get user's wishlist
	getMyWishlist = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const wishlist = await WishlistService.getUserWishlist(userId);

			// Format response to match frontend expectations
			const wishlistItems = wishlist.products.map((item) => ({
				id: item._id,
				userId: wishlist.user_id,
				productId: item.product_id?._id || item.product_id,
				product: item.product_id,
				addedAt: item.addedAt || wishlist.createdAt,
			}));

			return formatSuccess({
				res,
				message: 'Wishlist retrieved successfully',
				code: StatusCodes.OK,
				data: {
					wishlistItems,
					total: wishlistItems.length,
					page: 1,
					totalPages: 1,
				},
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Clear all products from wishlist
	clearWishlist = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const wishlist = await WishlistService.clearWishlist(userId);
			return formatSuccess({
				res,
				message: 'Wishlist cleared successfully',
				code: StatusCodes.OK,
				data: wishlist,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Toggle product in wishlist (add if not exists, remove if exists)
	toggleProductInWishlist = catchAsync(async (req, res) => {
		const { error, value } = WishListValidation.addToWishlist.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			const userId = req.user.id;
			const { productId } = value;

			const result = await WishlistService.toggleProductInWishlist(
				userId,
				productId
			);

			// Format wishlist item for frontend
			let wishlistItem = null;
			if (result.action === 'added' && result.wishlistItem) {
				wishlistItem = {
					id: result.wishlistItem._id,
					userId: userId,
					productId:
						result.wishlistItem.product_id?._id ||
						result.wishlistItem.product_id,
					product: result.wishlistItem.product_id,
					addedAt: result.wishlistItem.addedAt || new Date(),
				};
			}

			return formatSuccess({
				res,
				message: 'Wishlist updated successfully',
				code: StatusCodes.OK,
				data: {
					action: result.action,
					productId: productId,
					wishlistItem: wishlistItem,
				},
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Check if product is in wishlist
	checkProductInWishlist = catchAsync(async (req, res) => {
		const { productId } = req.params;

		if (!productId) {
			return formatFail({
				res,
				message: 'Product ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const userId = req.user.id;
			const isInWishlist = await WishlistService.isProductInWishlist(
				userId,
				productId
			);
			return formatSuccess({
				res,
				message: 'Product wishlist status retrieved successfully',
				code: StatusCodes.OK,
				data: { isInWishlist },
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get wishlist count
	getWishlistCount = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const countData = await WishlistService.getWishlistCount(userId);
			return formatSuccess({
				res,
				message: 'Wishlist count retrieved successfully',
				code: StatusCodes.OK,
				data: countData,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get all wishlists (for admin)
	getAllWishlists = catchAsync(async (req, res) => {
		try {
			const { page = 1, limit = 10 } = req.query;
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await WishlistService.getAllWishlists(options);
			return formatSuccess({
				res,
				message: 'All wishlists retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
}

export default new WishListController();
