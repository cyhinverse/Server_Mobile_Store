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
	createWishList = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Wishlist data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		if (!userId || !productId) {
			return formatFail(
				res,
				'User ID and Product ID are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const _WishListValidation = WishListValidation.create;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const wishList = await WishlistService.createWishList(userId, productId);
		if (!wishList) {
			return formatError(
				res,
				'Failed to create wishlist',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Wishlist created successfully',
			{},
			StatusCodes.CREATED
		);
	});
	updateWishList = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Update data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		if (!userId || !productId) {
			return formatFail(
				res,
				'User ID and Product ID are required to update a wishlist',
				StatusCodes.BAD_REQUEST
			);
		}

		const _WishListValidation = WishListValidation.update;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const existingWishList = await WishlistService.updateWishList(
			userId,
			productId
		);
		if (!existingWishList) {
			return formatFail(
				res,
				'Wishlist not found for this user',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Wishlist updated successfully',
			{},
			StatusCodes.OK
		);
	});
	deleteItem = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Delete data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		if (!userId || !productId) {
			return formatFail(
				res,
				'User ID and Product ID are required to delete an item from wishlist',
				StatusCodes.BAD_REQUEST
			);
		}

		const _WishListValidation = WishListValidation.delete;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const deletedItem = await WishlistService.deleteItem(userId, productId);
		if (!deletedItem) {
			return formatFail(
				res,
				'Wishlist item not found for this user',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Item deleted from wishlist successfully',
			{},
			StatusCodes.OK
		);
	});
	clearWishList = catchAsync(async (req, res) => {
		const { userId } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(res, 'User data is required', StatusCodes.BAD_REQUEST);
		}

		if (!userId) {
			return formatFail(
				res,
				'User ID is required to clear wishlist',
				StatusCodes.BAD_REQUEST
			);
		}

		const _WishListValidation = WishListValidation.clear;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const clearedWishList = await WishlistService.clearWishList(userId);
		if (!clearedWishList) {
			return formatFail(
				res,
				'Wishlist not found for this user',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Wishlist cleared successfully',
			{},
			StatusCodes.OK
		);
	});
	getWishListById = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validate input data
		if (!userId) {
			return formatFail(
				res,
				'User ID is required to get wishlist',
				StatusCodes.BAD_REQUEST
			);
		}

		const _WishListValidation = WishListValidation.get;
		const { error } = _WishListValidation.validate(req.params);
		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const wishList = await WishlistService.getWishListById(userId);
		if (!wishList || wishList === null) {
			return formatFail(
				res,
				'Wishlist not found for this user',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Wishlist retrieved successfully',
			{ data: wishList },
			StatusCodes.OK
		);
	});
}

export default new WishListController();
