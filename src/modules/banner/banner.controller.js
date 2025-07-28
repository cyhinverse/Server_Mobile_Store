import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import bannerService from './banner.service.js';
import { ValidationBanner } from './banner.validation.js';
import {
	formatSuccess,
	formatFail,
} from '../../shared/response/responseFormatter.js';
import BaseController from '../../core/controller/base.controller.js';

class BannerController extends BaseController {
	constructor() {
		super(bannerService);
	}

	/**
	 * Create new banner
	 * POST /api/banners
	 */
	createBanner = catchAsync(async (req, res) => {
		const { error } = ValidationBanner.createBanner.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const banner = await bannerService.createBanner(req.body);

		return formatSuccess({
			res,
			data: banner,
			message: 'Banner created successfully',
			code: StatusCodes.CREATED,
		});
	});

	/**
	 * Get all banners
	 * GET /api/banners
	 */
	getAllBanners = catchAsync(async (req, res) => {
		const banners = await bannerService.getAllBanners();

		return formatSuccess({
			res,
			data: banners,
			message: 'Banners retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get banner by ID
	 * GET /api/banners/:id
	 */
	getBannerById = catchAsync(async (req, res) => {
		const { id } = req.params;

		const banner = await bannerService.getBannerById(id);

		return formatSuccess({
			res,
			data: banner,
			message: 'Banner retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get banners with pagination
	 * GET /api/banners/paginated
	 */
	getBannersPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search = '', type = '', isActive } = req.query;

		const paginationData = await bannerService.getBannersPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
			search,
			type,
			isActive: isActive !== undefined ? isActive === 'true' : null,
		});

		return formatSuccess({
			res,
			data: paginationData.banners,
			message: 'Banners retrieved with pagination successfully',
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
	 * Get active banners by type
	 * GET /api/banners/active/:type
	 */
	getActiveBannersByType = catchAsync(async (req, res) => {
		const { type } = req.params;

		const banners = await bannerService.getActiveBannersByType(type);

		return formatSuccess({
			res,
			data: banners,
			message: 'Active banners retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get banners by position
	 * GET /api/banners/position/:position
	 */
	getBannersByPosition = catchAsync(async (req, res) => {
		const { position } = req.params;

		const banners = await bannerService.getBannersByPosition(parseInt(position));

		return formatSuccess({
			res,
			data: banners,
			message: 'Banners by position retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Update banner
	 * PUT /api/banners/:id
	 */
	updateBanner = catchAsync(async (req, res) => {
		const { id } = req.params;

		const { error } = ValidationBanner.updateBanner.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const banner = await bannerService.updateBanner(id, req.body);

		return formatSuccess({
			res,
			data: banner,
			message: 'Banner updated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Delete banner
	 * DELETE /api/banners/:id
	 */
	deleteBanner = catchAsync(async (req, res) => {
		const { id } = req.params;

		await bannerService.deleteBanner(id);

		return formatSuccess({
			res,
			data: null,
			message: 'Banner deleted successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Update banner position
	 * PATCH /api/banners/:id/position
	 */
	updateBannerPosition = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { position } = req.body;

		if (position === undefined || position === null) {
			return formatFail({
				res,
				message: 'Position is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const banner = await bannerService.updateBannerPosition(id, parseInt(position));

		return formatSuccess({
			res,
			data: banner,
			message: 'Banner position updated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Bulk update banner status
	 * PATCH /api/banners/bulk/status
	 */
	bulkUpdateBannerStatus = catchAsync(async (req, res) => {
		const { ids, isActive } = req.body;

		if (!ids || !Array.isArray(ids) || isActive === undefined) {
			return formatFail({
				res,
				message: 'Banner IDs and status are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const result = await bannerService.bulkUpdateBannerStatus(ids, isActive);

		return formatSuccess({
			res,
			data: result,
			message: 'Banner status updated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Reorder banners
	 * PATCH /api/banners/reorder
	 */
	reorderBanners = catchAsync(async (req, res) => {
		const { bannerIDs } = req.body;

		if (!bannerIDs || !Array.isArray(bannerIDs) || bannerIDs.length === 0) {
			return formatFail({
				res,
				message: 'Banner IDs are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const result = await bannerService.reorderBanners(bannerIDs);

		return formatSuccess({
			res,
			data: result,
			message: 'Banners reordered successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get banner statistics
	 * GET /api/banners/stats
	 */
	getBannerStats = catchAsync(async (req, res) => {
		const stats = await bannerService.getBannerStats();

		return formatSuccess({
			res,
			data: stats,
			message: 'Banner statistics retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get banners by date range
	 * GET /api/banners/date-range
	 */
	getBannersByDateRange = catchAsync(async (req, res) => {
		const { startDate, endDate } = req.query;

		if (!startDate || !endDate) {
			return formatFail({
				res,
				message: 'Start date and end date are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const banners = await bannerService.getBannersByDateRange(startDate, endDate);

		return formatSuccess({
			res,
			data: banners,
			message: 'Banners by date range retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get expired banners
	 * GET /api/banners/expired
	 */
	getExpiredBanners = catchAsync(async (req, res) => {
		const banners = await bannerService.getExpiredBanners();

		return formatSuccess({
			res,
			data: banners,
			message: 'Expired banners retrieved successfully',
			code: StatusCodes.OK,
		});
	});
}

export default new BannerController();
