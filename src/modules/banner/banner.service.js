import { catchAsync } from '../../configs/catchAsync.js';
import BaseService from '../../core/service/base.service.js';
import bannerRepository from './banner.repository.js';

class BannerService extends BaseService {
	constructor() {
		super(bannerRepository);
		this.bannerRepo = bannerRepository;
	}

	/**
	 * Create new banner
	 */
	createBanner = catchAsync(async (data) => {
		const {
			imageUrl,
			title,
			type,
			linkTo,
			position,
			isActive,
			startDate,
			endDate,
		} = data;

		// Business validation
		if (!imageUrl || !title || !linkTo || position === undefined) {
			throw new Error('Image URL, title, link, and position are required');
		}

		// Validate date range if provided
		if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
			throw new Error('Start date must be before end date');
		}

		return await this.bannerRepo.create({
			imageUrl,
			title,
			type: type || 'banner',
			linkTo,
			position,
			isActive: isActive !== undefined ? isActive : true,
			startDate: startDate ? new Date(startDate) : null,
			endDate: endDate ? new Date(endDate) : null,
		});
	});

	/**
	 * Get all banners
	 */
	getAllBanners = catchAsync(async () => {
		return await this.bannerRepo.findAll();
	});

	/**
	 * Get banner by ID
	 */
	getBannerById = catchAsync(async (id) => {
		const banner = await this.bannerRepo.findById(id);
		if (!banner) {
			throw new Error('Banner not found');
		}
		return banner;
	});

	/**
	 * Get banners with pagination
	 */
	getBannersPaginated = catchAsync(
		async ({ page, limit, search, type, isActive }) => {
			return await this.bannerRepo.findWithPagination({
				page,
				limit,
				search,
				type,
				isActive,
			});
		}
	);

	/**
	 * Get active banners by type
	 */
	getActiveBannersByType = catchAsync(async (type) => {
		return await this.bannerRepo.findActiveByType(type);
	});

	/**
	 * Get banners by position
	 */
	getBannersByPosition = catchAsync(async (position) => {
		return await this.bannerRepo.findByPosition(position);
	});

	/**
	 * Update banner
	 */
	updateBanner = catchAsync(async (id, data) => {
		const existingBanner = await this.bannerRepo.findById(id);
		if (!existingBanner) {
			throw new Error('Banner not found');
		}

		// Validate date range if provided
		const startDate = data.startDate || existingBanner.startDate;
		const endDate = data.endDate || existingBanner.endDate;

		if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
			throw new Error('Start date must be before end date');
		}

		return await this.bannerRepo.update(id, data);
	});

	/**
	 * Delete banner
	 */
	deleteBanner = catchAsync(async (id) => {
		const banner = await this.bannerRepo.findById(id);
		if (!banner) {
			throw new Error('Banner not found');
		}

		return await this.bannerRepo.delete(id);
	});

	/**
	 * Update banner position
	 */
	updateBannerPosition = catchAsync(async (id, position) => {
		const banner = await this.bannerRepo.findById(id);
		if (!banner) {
			throw new Error('Banner not found');
		}

		return await this.bannerRepo.updatePosition(id, position);
	});

	/**
	 * Bulk update banner status
	 */
	bulkUpdateBannerStatus = catchAsync(async (ids, isActive) => {
		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			throw new Error('Banner IDs are required');
		}

		return await this.bannerRepo.bulkUpdateStatus(ids, isActive);
	});

	/**
	 * Get banner statistics
	 */
	getBannerStats = catchAsync(async () => {
		return await this.bannerRepo.getBannerStats();
	});

	/**
	 * Get banners by date range
	 */
	getBannersByDateRange = catchAsync(async (startDate, endDate) => {
		if (!startDate || !endDate) {
			throw new Error('Start date and end date are required');
		}

		if (new Date(startDate) >= new Date(endDate)) {
			throw new Error('Start date must be before end date');
		}

		return await this.bannerRepo.findByDateRange(
			new Date(startDate),
			new Date(endDate)
		);
	});

	/**
	 * Get expired banners
	 */
	getExpiredBanners = catchAsync(async () => {
		return await this.bannerRepo.findExpiredBanners();
	});

	/**
	 * Reorder banners
	 */
	reorderBanners = catchAsync(async (bannerIDs) => {
		if (!bannerIDs || !Array.isArray(bannerIDs) || bannerIDs.length === 0) {
			throw new Error('Banner IDs are required');
		}

		// Update positions
		const promises = bannerIDs.map((id, index) =>
			this.bannerRepo.updatePosition(id, index + 1)
		);

		return await Promise.all(promises);
	});
}

export default new BannerService();
