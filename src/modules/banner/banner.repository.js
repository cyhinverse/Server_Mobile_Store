import BaseRepository from '../../core/repository/base.repository.js';
import Banner from './banner.model.js';
import { getPaginationMeta } from '../../shared/response/pagination.js';

class BannerRepository extends BaseRepository {
	constructor() {
		super(Banner);
	}

	/**
	 * Find banners with pagination and filters
	 */
	async findWithPagination({
		page = 1,
		limit = 10,
		search = '',
		type = '',
		isActive = null,
	}) {
		const skip = (page - 1) * limit;
		const filter = {};

		// Search filter
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ type: { $regex: search, $options: 'i' } },
			];
		}

		// Type filter
		if (type) {
			filter.type = type;
		}

		// Active status filter
		if (isActive !== null) {
			filter.isActive = isActive;
		}

		const [banners, totalItems] = await Promise.all([
			this.model
				.find(filter)
				.sort({ position: 1, createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			this.model.countDocuments(filter),
		]);

		const pagination = getPaginationMeta(page, limit, totalItems);

		return {
			banners,
			...pagination,
		};
	}

	/**
	 * Find active banners by type
	 */
	async findActiveByType(type) {
		return await this.model
			.find({
				type,
				isActive: true,
				$or: [
					{ startDate: { $lte: new Date() }, endDate: { $gte: new Date() } },
					{ startDate: null, endDate: null },
				],
			})
			.sort({ position: 1 })
			.lean();
	}

	/**
	 * Find banners by position
	 */
	async findByPosition(position) {
		return await this.model.find({ position }).sort({ createdAt: -1 }).lean();
	}

	/**
	 * Update banner position
	 */
	async updatePosition(id, position) {
		return await this.model
			.findByIdAndUpdate(id, { position }, { new: true, runValidators: true })
			.lean();
	}

	/**
	 * Find expired banners
	 */
	async findExpiredBanners() {
		return await this.model
			.find({
				endDate: { $lt: new Date() },
				isActive: true,
			})
			.lean();
	}

	/**
	 * Bulk update banner status
	 */
	async bulkUpdateStatus(ids, isActive) {
		return await this.model.updateMany(
			{ _id: { $in: ids } },
			{ isActive },
			{ runValidators: true }
		);
	}

	/**
	 * Get banner statistics
	 */
	async getBannerStats() {
		const [totalBanners, activeBanners, bannersByType] = await Promise.all([
			this.model.countDocuments(),
			this.model.countDocuments({ isActive: true }),
			this.model.aggregate([
				{
					$group: {
						_id: '$type',
						count: { $sum: 1 },
						activeCount: {
							$sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
						},
					},
				},
			]),
		]);

		return {
			totalBanners,
			activeBanners,
			inactiveBanners: totalBanners - activeBanners,
			bannersByType,
		};
	}

	/**
	 * Find banners by date range
	 */
	async findByDateRange(startDate, endDate) {
		return await this.model
			.find({
				$or: [
					{
						startDate: { $gte: startDate, $lte: endDate },
					},
					{
						endDate: { $gte: startDate, $lte: endDate },
					},
					{
						startDate: { $lte: startDate },
						endDate: { $gte: endDate },
					},
				],
			})
			.sort({ startDate: 1 })
			.lean();
	}
}

export default new BannerRepository();
