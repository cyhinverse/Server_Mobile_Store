import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import BannerService from './banner.service.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class BannerController {
	constructor() {
		if (!BannerController.instance) return BannerController.instance;
		BannerController.instance = this;
	}
	createBanner = catchAsync(async (req, res) => {
		const {
			imageUrl,
			title,
			type,
			linkTo,
			position,
			isActive,
			startDate,
			endDate,
		} = req.body;
		const data = {
			imageUrl,
			title,
			type,
			linkTo,
			position,
			isActive,
			startDate,
			endDate,
		};
		const createBanner = await BannerService.createBanner(data);
		if (!createBanner && createBanner === null) {
			return formatError({
				res,
				message: 'Can not create banner.',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			data: createBanner,
			message: 'Created banner successfully.',
			code: StatusCodes.CREATED,
		});
	});
	deleteBanner = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id) {
			return formatFail({
				res,
				message: 'Id is required.',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const deleted = await BannerService.deleteBanner(id);
		if (!deleted) {
			return formatError({
				res,
				message: 'Delete banner failed.',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			message: 'Delete banner successfully',
			code: StatusCodes.OK,
		});
	});
	getAllBanners = catchAsync(async (req, res) => {
		const banners = await BannerService.getAllBanners();
		if (!banners || banners.length === 0) {
			return formatFail({
				res,
				message: 'No banners found.',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: banners,
			message: 'Get all banners successfully.',
			code: StatusCodes.OK,
		});
	});
	getActiveBanners = catchAsync(async (req, res) => {
		const banners = await BannerService.getActiveBanners();
		if (!banners || banners.length === 0) {
			return formatFail({
				res,
				message: 'No active banners found.',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: banners,
			message: 'Get active banners successfully.',
			code: StatusCodes.OK,
		});
	});
	updateBanner = catchAsync(async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		if (!id || !data) {
			return formatFail({
				res,
				message: 'Id and data are required.',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const updatedBanner = await BannerService.updateBanner(id, data);
		if (!updatedBanner) {
			return formatError({
				res,
				message: 'Update banner failed.',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			data: updatedBanner,
			message: 'Update banner successfully.',
			code: StatusCodes.OK,
		});
	});
	reorderBanner = catchAsync(async (req, res) => {
		const { bannerIDs } = req.body;
		if (!bannerIDs || bannerIDs.length === 0) {
			return formatFail({
				res,
				message: 'Banner IDs are required.',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		await BannerService.reorderBanner(bannerIDs);
		return formatSuccess({
			res,
			message: 'Reordered banners successfully.',
			code: StatusCodes.OK,
		});
	});
}

export default new BannerController();
