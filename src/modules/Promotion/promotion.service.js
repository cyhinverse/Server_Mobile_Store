import promotionRepository from './promotion.repository.js';

class PromotionService {
	constructor() {
		if (PromotionService.instance) return PromotionService.instance;
		PromotionService.instance = this;
		this.promotionRepo = promotionRepository;
	}

	async createPromotion(promotionData) {
		// Business logic: Validate promotion data
		if (!promotionData) {
			throw new Error('Promotion data is required');
		}

		// Business logic: Check if promotion with same title already exists
		const existingPromotion = await this.promotionRepo.findByTitle(
			promotionData.title
		);
		if (existingPromotion) {
			throw new Error('Promotion with this title already exists');
		}

		// Business logic: Validate date range
		const startDate = new Date(promotionData.startDate);
		const endDate = new Date(promotionData.endDate);
		const currentDate = new Date();

		if (endDate <= startDate) {
			throw new Error('End date must be after start date');
		}

		if (startDate < currentDate) {
			throw new Error('Start date cannot be in the past');
		}

		// Business logic: Validate discount
		if (promotionData.discountPercent && promotionData.discountAmount) {
			throw new Error(
				'Cannot have both discount percentage and discount amount'
			);
		}

		if (!promotionData.discountPercent && !promotionData.discountAmount) {
			throw new Error(
				'Either discount percentage or discount amount is required'
			);
		}

		// Business logic: Validate discount values
		if (
			promotionData.discountPercent &&
			(promotionData.discountPercent < 0 || promotionData.discountPercent > 100)
		) {
			throw new Error('Discount percentage must be between 0 and 100');
		}

		if (promotionData.discountAmount && promotionData.discountAmount < 0) {
			throw new Error('Discount amount must be greater than 0');
		}

		// Business logic: Set default values
		const processedData = {
			...promotionData,
			isActive:
				promotionData.isActive !== undefined ? promotionData.isActive : true,
			createdAt: new Date(),
		};

		return await this.promotionRepo.create(processedData);
	}

	async getAllPromotions(query = {}) {
		// Business logic: Validate and process query parameters
		const page = Math.max(1, parseInt(query.page) || 1);
		const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10)); // Max 100 items per page
		const sortBy = query.sortBy || 'createdAt';
		const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

		// Business logic: Process filter parameters
		const filter = {};

		if (query.isActive !== undefined) {
			filter.isActive = query.isActive === 'true' || query.isActive === true;
		}

		if (query.search && query.search.trim()) {
			filter.search = query.search.trim();
		}

		if (query.startDate) {
			filter.startDate = query.startDate;
		}

		if (query.endDate) {
			filter.endDate = query.endDate;
		}

		const result = await this.promotionRepo.findAllWithFilter(
			filter,
			page,
			limit,
			sortBy,
			sortOrder
		);

		if (!result.data.length) {
			throw new Error('No promotions found');
		}

		return result;
	}

	async getPromotionById(id) {
		// Business logic: Validate ID
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		const promotion = await this.promotionRepo.findById(id);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		return promotion;
	}

	async updatePromotion(id, updateData) {
		// Business logic: Validate inputs
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		if (!updateData || Object.keys(updateData).length === 0) {
			throw new Error('Update data is required');
		}

		// Business logic: Check if promotion exists
		const existingPromotion = await this.promotionRepo.findById(id);
		if (!existingPromotion) {
			throw new Error('Promotion not found');
		}

		// Business logic: Check title uniqueness if updating title
		if (updateData.title && updateData.title !== existingPromotion.title) {
			const titleExists = await this.promotionRepo.findByTitle(
				updateData.title
			);
			if (titleExists && titleExists._id.toString() !== id) {
				throw new Error('Promotion with this title already exists');
			}
		}

		// Business logic: Validate date range if dates are being updated
		const startDate = new Date(
			updateData.startDate || existingPromotion.startDate
		);
		const endDate = new Date(updateData.endDate || existingPromotion.endDate);

		if (endDate <= startDate) {
			throw new Error('End date must be after start date');
		}

		// Business logic: Validate discount updates
		if (
			updateData.discountPercent !== undefined &&
			updateData.discountAmount !== undefined
		) {
			if (updateData.discountPercent && updateData.discountAmount) {
				throw new Error(
					'Cannot have both discount percentage and discount amount'
				);
			}
		}

		if (updateData.discountPercent !== undefined) {
			if (updateData.discountPercent < 0 || updateData.discountPercent > 100) {
				throw new Error('Discount percentage must be between 0 and 100');
			}
		}

		if (updateData.discountAmount !== undefined) {
			if (updateData.discountAmount < 0) {
				throw new Error('Discount amount must be greater than 0');
			}
		}

		// Business logic: Process update data
		const processedData = {
			...updateData,
			updatedAt: new Date(),
		};

		return await this.promotionRepo.update(id, processedData);
	}

	async deletePromotion(id) {
		// Business logic: Validate ID
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		// Business logic: Check if promotion exists
		const promotion = await this.promotionRepo.findById(id);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Business logic: Check if promotion is currently active
		const currentDate = new Date();
		if (
			promotion.isActive &&
			promotion.startDate <= currentDate &&
			promotion.endDate >= currentDate
		) {
			throw new Error(
				'Cannot delete an active promotion. Please deactivate it first.'
			);
		}

		return await this.promotionRepo.delete(id);
	}

	async togglePromotionStatus(id) {
		// Business logic: Validate ID
		if (!id) {
			throw new Error('Promotion ID is required');
		}

		const promotion = await this.promotionRepo.findById(id);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Business logic: Check if promotion can be activated
		if (!promotion.isActive) {
			const currentDate = new Date();
			if (promotion.endDate < currentDate) {
				throw new Error('Cannot activate an expired promotion');
			}
		}

		return await this.promotionRepo.updateStatus(id, !promotion.isActive);
	}

	async getActivePromotions() {
		// Business logic: Get current active promotions
		const currentDate = new Date();

		const activePromotions = await this.promotionRepo.findActivePromotions(
			currentDate
		);

		if (!activePromotions.length) {
			throw new Error('No active promotions found');
		}

		return activePromotions;
	}

	async getPromotionsByProduct(productId) {
		// Business logic: Validate product ID
		if (!productId) {
			throw new Error('Product ID is required');
		}

		const currentDate = new Date();
		const promotions = await this.promotionRepo.findPromotionsForProduct(
			productId,
			currentDate
		);

		if (!promotions.length) {
			throw new Error('No promotions found for this product');
		}

		return promotions;
	}

	async addProductsToPromotion(promotionId, productIds) {
		// Business logic: Validate inputs
		if (!promotionId) {
			throw new Error('Promotion ID is required');
		}

		if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
			throw new Error('Product IDs array is required');
		}

		// Business logic: Check if promotion exists
		const promotion = await this.promotionRepo.findById(promotionId);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Business logic: Filter out duplicate products
		const existingProductIds = promotion.applicableProducts.map((p) =>
			p._id.toString()
		);
		const newProductIds = productIds.filter(
			(id) => !existingProductIds.includes(id)
		);

		if (newProductIds.length === 0) {
			throw new Error('All specified products are already in this promotion');
		}

		// Business logic: Create updated product list
		const updatedProductIds = [...existingProductIds, ...newProductIds];

		return await this.promotionRepo.update(promotionId, {
			applicableProducts: updatedProductIds,
		});
	}

	async removeProductsFromPromotion(promotionId, productIds) {
		// Business logic: Validate inputs
		if (!promotionId) {
			throw new Error('Promotion ID is required');
		}

		if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
			throw new Error('Product IDs array is required');
		}

		// Business logic: Check if promotion exists
		const promotion = await this.promotionRepo.findById(promotionId);
		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Business logic: Filter out specified products
		const existingProductIds = promotion.applicableProducts.map((p) =>
			p._id.toString()
		);
		const filteredProductIds = existingProductIds.filter(
			(id) => !productIds.includes(id)
		);

		if (filteredProductIds.length === existingProductIds.length) {
			throw new Error('None of the specified products are in this promotion');
		}

		return await this.promotionRepo.update(promotionId, {
			applicableProducts: filteredProductIds,
		});
	}

	async getExpiredPromotions() {
		// Business logic: Get promotions that have ended
		const currentDate = new Date();

		const filter = { endDate: { $lt: currentDate } };
		const result = await this.promotionRepo.findAllWithFilter(filter);

		if (!result.data.length) {
			throw new Error('No expired promotions found');
		}

		return result.data;
	}

	async getUpcomingPromotions() {
		// Business logic: Get promotions that haven't started yet
		const currentDate = new Date();

		const filter = { startDate: { $gt: currentDate } };
		const result = await this.promotionRepo.findAllWithFilter(filter);

		if (!result.data.length) {
			throw new Error('No upcoming promotions found');
		}

		return result.data;
	}

	async getExpiringPromotions(days = 7) {
		// Business logic: Validate days parameter
		const validDays = Math.max(1, Math.min(30, parseInt(days))); // Between 1-30 days

		const expiringPromotions = await this.promotionRepo.findExpiringPromotions(
			validDays
		);

		if (!expiringPromotions.length) {
			throw new Error(`No promotions expiring in the next ${validDays} days`);
		}

		return expiringPromotions;
	}

	async validatePromotionForProducts(productIds) {
		// Business logic: Validate multiple products have valid promotions
		if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
			throw new Error('Product IDs array is required');
		}

		const currentDate = new Date();
		const promotions = await this.promotionRepo.findByProducts(
			productIds,
			currentDate
		);

		// Business logic: Group promotions by product
		const productPromotions = {};

		promotions.forEach((promotion) => {
			promotion.applicableProducts.forEach((product) => {
				if (productIds.includes(product._id.toString())) {
					if (!productPromotions[product._id]) {
						productPromotions[product._id] = [];
					}
					productPromotions[product._id].push(promotion);
				}
			});
		});

		return productPromotions;
	}
}

export default new PromotionService();
