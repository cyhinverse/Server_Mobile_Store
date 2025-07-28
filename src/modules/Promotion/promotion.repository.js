import BaseRepository from '../../core/repository/base.repository.js';
import Promotion from './promotion.model.js';

class PromotionRepository extends BaseRepository {
	constructor() {
		super(Promotion);
	}

	// Tìm promotion theo title
	async findByTitle(title) {
		try {
			const promotion = await this.model.findOne({ title: title });
			return promotion;
		} catch (error) {
			throw new Error('Error finding promotion by title: ' + error.message);
		}
	}

	// Lấy tất cả promotions với filter và pagination
	async findAllWithFilter(
		filter = {},
		page = 1,
		limit = 10,
		sortBy = 'createdAt',
		sortOrder = 'desc'
	) {
		try {
			const query = {};

			// Filter by active status
			if (filter.isActive !== undefined) {
				query.isActive = filter.isActive;
			}

			// Filter by search (title hoặc description)
			if (filter.search) {
				const searchRegex = new RegExp(filter.search, 'i');
				query.$or = [{ title: searchRegex }, { description: searchRegex }];
			}

			// Filter by date range
			if (filter.startDate || filter.endDate) {
				query.startDate = {};
				if (filter.startDate) query.startDate.$gte = new Date(filter.startDate);
				if (filter.endDate) query.startDate.$lte = new Date(filter.endDate);
			}

			const skip = (page - 1) * limit;
			const sortObject = {};
			sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

			const [promotions, total] = await Promise.all([
				this.model
					.find(query)
					.populate('applicableProducts', 'name price thumbnail')
					.sort(sortObject)
					.skip(skip)
					.limit(limit),
				this.model.countDocuments(query),
			]);

			return {
				data: promotions,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			throw new Error('Error finding promotions: ' + error.message);
		}
	}

	// Tìm promotion active trong khoảng thời gian
	async findActivePromotions(currentDate = new Date()) {
		try {
			const promotions = await this.model
				.find({
					isActive: true,
					startDate: { $lte: currentDate },
					endDate: { $gte: currentDate },
				})
				.populate('applicableProducts', 'name price thumbnail')
				.sort({ createdAt: -1 });

			return promotions;
		} catch (error) {
			throw new Error('Error finding active promotions: ' + error.message);
		}
	}

	// Tìm promotion cho sản phẩm cụ thể
	async findPromotionsForProduct(productId, currentDate = new Date()) {
		try {
			const promotions = await this.model
				.find({
					isActive: true,
					startDate: { $lte: currentDate },
					endDate: { $gte: currentDate },
					applicableProducts: { $in: [productId] },
				})
				.populate('applicableProducts', 'name price thumbnail')
				.sort({ discountPercent: -1, discountAmount: -1 });

			return promotions;
		} catch (error) {
			throw new Error('Error finding promotions for product: ' + error.message);
		}
	}

	// Tìm promotions sắp hết hạn
	async findExpiringPromotions(days = 7) {
		try {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + days);

			const promotions = await this.model
				.find({
					isActive: true,
					endDate: {
						$gte: new Date(),
						$lte: futureDate,
					},
				})
				.populate('applicableProducts', 'name price thumbnail')
				.sort({ endDate: 1 });

			return promotions;
		} catch (error) {
			throw new Error('Error finding expiring promotions: ' + error.message);
		}
	}

	// Cập nhật trạng thái promotion
	async updateStatus(id, isActive) {
		try {
			const updatedPromotion = await this.model
				.findByIdAndUpdate(
					id,
					{ isActive: isActive, updatedAt: new Date() },
					{ new: true }
				)
				.populate('applicableProducts', 'name price thumbnail');

			if (!updatedPromotion) {
				throw new Error('Promotion not found');
			}

			return updatedPromotion;
		} catch (error) {
			throw new Error('Error updating promotion status: ' + error.message);
		}
	}

	// Tìm promotions theo danh sách sản phẩm
	async findByProducts(productIds, currentDate = new Date()) {
		try {
			const promotions = await this.model
				.find({
					isActive: true,
					startDate: { $lte: currentDate },
					endDate: { $gte: currentDate },
					applicableProducts: { $in: productIds },
				})
				.populate('applicableProducts', 'name price thumbnail')
				.sort({ discountPercent: -1, discountAmount: -1 });

			return promotions;
		} catch (error) {
			throw new Error('Error finding promotions by products: ' + error.message);
		}
	}

	// Override findById để include populate
	async findById(id) {
		try {
			const promotion = await this.model
				.findById(id)
				.populate('applicableProducts', 'name price thumbnail');

			if (!promotion) {
				throw new Error('Promotion not found');
			}

			return promotion;
		} catch (error) {
			throw new Error('Error finding promotion: ' + error.message);
		}
	}

	// Override update để include populate
	async update(id, data) {
		try {
			if (!id || !data || typeof data !== 'object') {
				throw new Error('Invalid ID or data for update');
			}

			const updatedData = await this.model
				.findByIdAndUpdate(
					id,
					{ $set: { ...data, updatedAt: new Date() } },
					{ new: true }
				)
				.populate('applicableProducts', 'name price thumbnail');

			if (!updatedData) {
				throw new Error('Promotion not found for update');
			}

			return updatedData;
		} catch (error) {
			throw new Error('Error updating promotion: ' + error.message);
		}
	}

	// Override create để include populate
	async create(data) {
		try {
			const createdData = await this.model.create(data);
			const populatedData = await this.model
				.findById(createdData._id)
				.populate('applicableProducts', 'name price thumbnail');

			return populatedData;
		} catch (error) {
			throw new Error('Error creating promotion: ' + error.message);
		}
	}
}

export default new PromotionRepository();
