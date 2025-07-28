import reviewRepository from './review.repository.js';

class ReviewService {
	constructor() {
		if (ReviewService.instance) return ReviewService.instance;
		this.reviewRepo = reviewRepository;
		ReviewService.instance = this;
	}

	async createReview(reviewData) {
		if (!reviewData) {
			throw new Error('Review data is required');
		}

		const { userId, productId, rating, comment } = reviewData;

		// Check if user already reviewed this product
		const hasReviewed = await this.reviewRepo.hasUserReviewedProduct(
			userId,
			productId
		);
		if (hasReviewed) {
			throw new Error('User has already reviewed this product');
		}

		const processedData = {
			user_id: userId,
			product_id: productId,
			rating: parseInt(rating),
			comment: comment || '',
			createdAt: new Date(),
		};

		const result = await this.reviewRepo.create(processedData);
		if (!result.success) {
			throw new Error(result.error || 'Failed to create review');
		}

		return result.data;
	}

	async updateReview(reviewData) {
		const { id, rating, comment } = reviewData;

		if (!id) {
			throw new Error('Review ID is required');
		}

		const reviewExists = await this.reviewRepo.findById(id);
		if (!reviewExists.success || !reviewExists.data) {
			throw new Error('Review not found');
		}

		const updateData = {
			rating: parseInt(rating),
			comment: comment || '',
			updatedAt: new Date(),
		};

		const result = await this.reviewRepo.update(id, updateData);
		if (!result.success) {
			throw new Error(result.error || 'Failed to update review');
		}

		return result.data;
	}

	async deleteReview(id) {
		if (!id) {
			throw new Error('Review ID is required');
		}

		const reviewExists = await this.reviewRepo.findById(id);
		if (!reviewExists.success || !reviewExists.data) {
			throw new Error('Review not found');
		}

		const result = await this.reviewRepo.delete(id);
		if (!result.success) {
			throw new Error(result.error || 'Failed to delete review');
		}

		return result.data;
	}

	async getReviewsByProductId(productId, options = {}) {
		if (!productId) {
			throw new Error('Product ID is required');
		}

		const result = await this.reviewRepo.getReviewsByProductId(
			productId,
			options
		);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get reviews');
		}

		return result;
	}

	async getReviewsByUserId(userId, options = {}) {
		if (!userId) {
			throw new Error('User ID is required');
		}

		const result = await this.reviewRepo.getReviewsByUserId(userId, options);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get user reviews');
		}

		return result;
	}

	async getAllReviews(filters = {}, options = {}) {
		const result = await this.reviewRepo.getAllReviewsWithFilters(
			filters,
			options
		);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get reviews');
		}

		return result;
	}

	async getReviewById(id) {
		if (!id) {
			throw new Error('Review ID is required');
		}

		const result = await this.reviewRepo.findById(id);
		if (!result.success) {
			throw new Error(result.error || 'Failed to get review');
		}

		if (!result.data) {
			throw new Error('Review not found');
		}

		return result.data;
	}

	async getProductReviewStats(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}

		return await this.reviewRepo.getProductReviewStats(productId);
	}
}

export default new ReviewService();
