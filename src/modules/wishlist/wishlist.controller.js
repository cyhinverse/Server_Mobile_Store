import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import WishlistService from './wishlist.service.js';
import { WishListValidation } from './wishlist.validation.js';

class WishListController {
	constructor() {
		if (WishListController.instance) return WishListController.instance;
		WishListController.instance = this;
	}
	createWishList = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;
		if (!userId || !productId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID and Product ID are required',
				success: false,
			});
		}
		const _WishListValidation = WishListValidation.create;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
				success: false,
			});
		}
		const wishList = await WishlistService.createWishList(userId, productId);
		if (!wishList) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to create wishlist',
				success: false,
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'Wishlist created successfully',
			success: true,
		});
	});
	updateWishList = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;
		if (!userId || !productId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID and Product ID are required to update a wishlist',
				success: false,
			});
		}
		const _WishListValidation = WishListValidation.update;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
				success: false,
			});
		}
		const existingWishList = await WishlistService.updateWishList(
			userId,
			productId
		);
		if (!existingWishList) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'Wishlist not found for this user',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Wishlist updated successfully',
			success: true,
		});
	});
	deleteItem = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;
		if (!userId || !productId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message:
					'User ID and Product ID are required to delete an item from wishlist',
				success: false,
			});
		}
		const _WishListValidation = WishListValidation.delete;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
				success: false,
			});
		}
		const detetedItem = await WishlistService.deleteItem(userId, productId);
		if (!detetedItem) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'Wishlist not found for this user',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Item deleted from wishlist successfully',
			success: true,
		});
	});
	clearWishList = catchAsync(async (req, res) => {
		const { userId } = req.body;
		if (!userId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID is required to clear wishlist',
				success: false,
			});
		}
		const _WishListValidation = WishListValidation.clear;
		const { error } = _WishListValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
				success: false,
			});
		}
		const clearedWishList = await WishlistService.clearWishList(userId);
		if (!clearedWishList) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'Wishlist not found for this user',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Wishlist cleared successfully',
			success: true,
		});
	});
	getWishListById = catchAsync(async (req, res) => {
		const { userId } = req.params;
		if (!userId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID is required to get wishlist',
				success: false,
			});
		}
		const _WishListValidation = WishListValidation.get;
		const { error } = _WishListValidation.validate(req.params);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
				success: false,
			});
		}
		const wishList = await WishlistService.getWishListById(userId);
		if (!wishList || wishList === null) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'Wishlist not found for this user',
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Wishlist retrieved successfully',
			success: true,
			data: wishList,
		});
	});
}

export default new WishListController();
