import Promotion from './promotion.model.js';

class PromotionService {
	constructor() {
		if (PromotionService.instance) return PromotionService.instance;
		this.model = Promotion;
		PromotionService.instance = this;
	}

	async createPromotion(promotionData) {
		if (!promotionData) {
			throw new Error('Promotion data is required');
		}

		// Check if promotion with same title already exists
		const existingPromotion = await this.model.findOne({
			title: promotionData.title,
		});

		if (existingPromotion) {
			throw new Error('Promotion with this title already exists');
		}

		const startDate = new Date(promotionData.startDate);
		const endDate = new Date(promotionData.endDate);

		if (endDate <= startDate) {
			throw new Error('End date must be after start date');
		}

		const newPromotion = new this.model(promotionData);
		const savedPromotion = await newPromotion.save();

		if (!savedPromotion) {
			throw new Error('Failed to create promotion');
		}

		return await this.model
			.findById(savedPromotion._id)
			.populate('applicableProducts', 'name price thumbnail');
	}

	async getAllPromotions(query = {}) {
		const {
			page = 1,
			limit = 10,
			isActive,
			search,
			sortBy = 'createdAt',
			sortOrder = 'desc',
		} = query;

		const filter = {};

		// Filter by active status
		if (typeof isActive === 'boolean') {
			filter.isActive = isActive;
		}

		// Search functionality
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			];
		}

		// Pagination
		const skip = (page - 1) * limit;
		const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

		const [promotions, total] = await Promise.all([
			this.model
				.find(filter)
				.populate('applicableProducts', 'name price thumbnail')
				.sort(sort)
				.skip(skip)
				.limit(parseInt(limit)),
			this.model.countDocuments(filter),
		]);

		return {
			promotions,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / limit),
				totalItems: total,
				itemsPerPage: parseInt(limit),
				hasNextPage: page < Math.ceil(total / limit),
				hasPrevPage: page > 1,
			},
		};
	}

	async getPromotionById(id) {
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		const promotion = await this.model
			.findById(id)
			.populate('applicableProducts', 'name price thumbnail slug');

		if (!promotion) {
			throw new Error('Promotion not found');
		}

		return promotion;
	}

	async updatePromotion(id, updateData) {
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		if (!updateData || Object.keys(updateData).length === 0) {
			throw new Error('Update data is required');
		}

		// Check if promotion exists
		const existingPromotion = await this.model.findById(id);
		if (!existingPromotion) {
			throw new Error('Promotion not found');
		}

		// Check if title is being updated and already exists
		if (updateData.title && updateData.title !== existingPromotion.title) {
			const titleExists = await this.model.findOne({
				title: updateData.title,
				_id: { $ne: id },
			});

			if (titleExists) {
				throw new Error('Promotion with this title already exists');
			}
		}

		// Validate date range if dates are being updated
		const startDate = updateData.startDate || existingPromotion.startDate;
		const endDate = updateData.endDate || existingPromotion.endDate;

		if (new Date(endDate) <= new Date(startDate)) {
			throw new Error('End date must be after start date');
		}

		const updatedPromotion = await this.model
			.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
			.populate('applicableProducts', 'name price thumbnail');

		if (!updatedPromotion) {
			throw new Error('Failed to update promotion');
		}

		return updatedPromotion;
	}

	async deletePromotion(id) {
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		const promotion = await this.model.findById(id);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		const deletedPromotion = await this.model.findByIdAndDelete(id);

		if (!deletedPromotion) {
			throw new Error('Failed to delete promotion');
		}

		return deletedPromotion;
	}

	async togglePromotionStatus(id) {
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		const promotion = await this.model.findById(id);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		const updatedPromotion = await this.model
			.findByIdAndUpdate(id, { isActive: !promotion.isActive }, { new: true })
			.populate('applicableProducts', 'name price thumbnail');

		return updatedPromotion;
	}

	async getActivePromotions() {
		const currentDate = new Date();

		const activePromotions = await this.model
			.find({
				isActive: true,
				startDate: { $lte: currentDate },
				endDate: { $gte: currentDate },
			})
			.populate('applicableProducts', 'name price thumbnail slug');

		return activePromotions;
	}

	async getPromotionsByProduct(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}

		const currentDate = new Date();

		const promotions = await this.model
			.find({
				isActive: true,
				startDate: { $lte: currentDate },
				endDate: { $gte: currentDate },
				applicableProducts: productId,
			})
			.populate('applicableProducts', 'name price thumbnail');

		return promotions;
	}

	async addProductsToPromotion(promotionId, productIds) {
		if (!promotionId) {
			throw new Error('Promotion ID is required');
		}

		if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
			throw new Error('Product IDs array is required');
		}

		const promotion = await this.model.findById(promotionId);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Add unique product IDs to the promotion
		const uniqueProductIds = [
			...new Set([...promotion.applicableProducts, ...productIds]),
		];

		const updatedPromotion = await this.model
			.findByIdAndUpdate(
				promotionId,
				{ applicableProducts: uniqueProductIds },
				{ new: true }
			)
			.populate('applicableProducts', 'name price thumbnail');

		return updatedPromotion;
	}

	async removeProductsFromPromotion(promotionId, productIds) {
		if (!promotionId) {
			throw new Error('Promotion ID is required');
		}

		if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
			throw new Error('Product IDs array is required');
		}

		const promotion = await this.model.findById(promotionId);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Remove specified product IDs from the promotion
		const filteredProductIds = promotion.applicableProducts.filter(
			(productId) => !productIds.includes(productId.toString())
		);

		const updatedPromotion = await this.model
			.findByIdAndUpdate(
				promotionId,
				{ applicableProducts: filteredProductIds },
				{ new: true }
			)
			.populate('applicableProducts', 'name price thumbnail');

		return updatedPromotion;
	}

	async getExpiredPromotions() {
		const currentDate = new Date();

		const expiredPromotions = await this.model
			.find({
				endDate: { $lt: currentDate },
			})
			.populate('applicableProducts', 'name price thumbnail');

		return expiredPromotions;
	}

	async getUpcomingPromotions() {
		const currentDate = new Date();

		const upcomingPromotions = await this.model
			.find({
				startDate: { $gt: currentDate },
			})
			.populate('applicableProducts', 'name price thumbnail');

		return upcomingPromotions;
	}
}

export default new PromotionService();
