import review from './review.model.js';

class ReviewService {
	constructor() {
		if (ReviewService.instance) return ReviewService.instance;
		this.model = review;
		ReviewService.instance = this;
	}
	async createReview(reviewData) {
		if (!reviewData) {
			throw new Error('Review data is required');
		}
		const newReview = new this.model(reviewData);
		if (!newReview) {
			throw new Error('Failed to create review');
		}
		return await newReview.save();
	}
	async updateReview(reviewData) {
		const { id, rating, comment } = reviewData;
		const reviewExists = await this.model.findById(id);
		if (!reviewExists) {
			throw new Error('Review not found');
		}
		const updateReview = await this.model.findByIdAndUpdate(
			id,
			{ rating, comment },
			{ new: true }
		);
		if (!updateReview) {
			throw new Error('Failed to update review');
		}
		return updateReview;
	}
	async deleteReview(id) {
		if (!id) {
			throw new Error('Review ID is required');
		}
		const reviewExists = await this.model.findById(id);
		if (!reviewExists) {
			throw new Error('Review not found');
		}
		const deletedReview = await this.model.findByIdAndDelete(id);
		if (!deletedReview) {
			throw new Error('Failed to delete review');
		}
		return deletedReview;
	}
	async getReviewsByProductId(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}
		const reviews = await this.model.find({ productId });
		if (!reviews || reviews.length === 0) {
			throw new Error('No reviews found for this product');
		}
		return reviews;
	}
	async getReviewsByUserId(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}
		const reviews = await this.model.find({ userId });
		if (!reviews || reviews.length === 0) {
			throw new Error('No reviews found for this user');
		}
		return reviews;
	}
}

export default new ReviewService();
