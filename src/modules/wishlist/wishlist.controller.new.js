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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const userId = req.user.id;
			const { productId } = value;

			const wishlist = await WishlistService.addToWishlist(userId, productId);
			return formatSuccess(
				res,
				'Product added to wishlist successfully',
				StatusCodes.OK,
				wishlist
			);
		} catch (error) {
			if (error.message.includes('already exists')) {
				return formatFail(res, error.message, StatusCodes.CONFLICT);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Remove product from wishlist
	removeFromWishlist = catchAsync(async (req, res) => {
		const { productId } = req.params;

		if (!productId) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const userId = req.user.id;
			const wishlist = await WishlistService.removeFromWishlist(
				userId,
				productId
			);
			return formatSuccess(
				res,
				'Product removed from wishlist successfully',
				StatusCodes.OK,
				wishlist
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Get user's wishlist
	getMyWishlist = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const wishlist = await WishlistService.getUserWishlist(userId);
			return formatSuccess(
				res,
				'Wishlist retrieved successfully',
				StatusCodes.OK,
				wishlist
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Clear all products from wishlist
	clearWishlist = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const wishlist = await WishlistService.clearWishlist(userId);
			return formatSuccess(
				res,
				'Wishlist cleared successfully',
				StatusCodes.OK,
				wishlist
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const userId = req.user.id;
			const { productId } = value;

			const wishlist = await WishlistService.toggleProductInWishlist(
				userId,
				productId
			);
			return formatSuccess(
				res,
				'Wishlist updated successfully',
				StatusCodes.OK,
				wishlist
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Check if product is in wishlist
	checkProductInWishlist = catchAsync(async (req, res) => {
		const { productId } = req.params;

		if (!productId) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const userId = req.user.id;
			const isInWishlist = await WishlistService.isProductInWishlist(
				userId,
				productId
			);
			return formatSuccess(
				res,
				'Product wishlist status retrieved successfully',
				StatusCodes.OK,
				{ isInWishlist }
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Get wishlist count
	getWishlistCount = catchAsync(async (req, res) => {
		try {
			const userId = req.user.id;
			const countData = await WishlistService.getWishlistCount(userId);
			return formatSuccess(
				res,
				'Wishlist count retrieved successfully',
				StatusCodes.OK,
				countData
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatSuccess(
				res,
				'All wishlists retrieved successfully',
				StatusCodes.OK,
				result
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});
}

export default new WishListController();
