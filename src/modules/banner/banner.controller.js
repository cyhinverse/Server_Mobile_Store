import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import BannerService from './banner.service.js';

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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Can not create banner.',
				access: false,
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'Created banner successfully.',
			access: true,
		});
	});
	deleteBanner = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Id is required.',
				success: false,
			});
		}
		const deleted = await BannerService.deleteBanner(id);
		if (!deleted) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Delete banner failed.',
				access: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Detele banner successfully',
			access: true,
		});
	});
	getAllBanners = catchAsync(async (req, res) => {
		const banners = await BannerService.getAllBanners();
		if (!banners || banners.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No banners found.',
				access: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Get all banners successfully.',
			access: true,
			data: banners,
		});
	});
	getActiveBanners = catchAsync(async (req, res) => {
		const banners = await BannerService.getActiveBanners();
		if (!banners || banners.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No active banners found.',
				access: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Get active banners successfully.',
			access: true,
			data: banners,
		});
	});
	updateBanner = catchAsync(async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		if (!id || !data) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Id and data are required.',
				access: false,
			});
		}
		const updatedBanner = await BannerService.updateBanner(id, data);
		if (!updatedBanner) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Update banner failed.',
				access: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Update banner successfully.',
			access: true,
			data: updatedBanner,
		});
	});
	reorderBanner = catchAsync(async (req, res) => {
		const { bannerIDs } = req.body;
		if (!bannerIDs || bannerIDs.length === 0) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Banner IDs are required.',
				access: false,
			});
		}
		await BannerService.reorderBanner(bannerIDs);
		return res.status(StatusCodes.OK).json({
			message: 'Reordered banners successfully.',
			access: true,
		});
	});
}

export default new BannerController();
