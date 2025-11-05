import BaseRepository from '../../core/repository/base.repository.js';
import Review from './review.model.js';

class ReviewRepository extends BaseRepository {
	constructor() {
		super(Review);
	}

	// Get reviews by product ID with pagination
	async getReviewsByProductId(productId, options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		try {
			const reviews = await this.model
				.find({ product_id: productId })
				.populate('user_id', 'fullName email avatar')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments({ product_id: productId });

			return {
				success: true,
				data: reviews,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Get reviews by user ID with pagination
	async getReviewsByUserId(userId, options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		try {
			const reviews = await this.model
				.find({ user_id: userId })
				.populate('product_id', 'name images price')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments({ user_id: userId });

			return {
				success: true,
				data: reviews,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	// Check if user already reviewed a product
	async hasUserReviewedProduct(userId, productId) {
		try {
			const review = await this.model.findOne({
				user_id: userId,
				product_id: productId,
			});
			return !!review;
		} catch (error) {
			throw new Error(`Error checking user review: ${error.message}`);
		}
	}

	// Get review statistics for a product
	async getProductReviewStats(productId) {
		try {
			const stats = await this.model.aggregate([
				{ $match: { product_id: productId } },
				{
					$group: {
						_id: null,
						totalReviews: { $sum: 1 },
						averageRating: { $avg: '$rating' },
						ratingDistribution: {
							$push: '$rating',
						},
					},
				},
			]);

			if (stats.length === 0) {
				return {
					totalReviews: 0,
					averageRating: 0,
					ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
				};
			}

			const result = stats[0];
			const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

			result.ratingDistribution.forEach((rating) => {
				distribution[rating]++;
			});

			return {
				totalReviews: result.totalReviews,
				averageRating: Math.round(result.averageRating * 10) / 10,
				ratingDistribution: distribution,
			};
		} catch (error) {
			throw new Error(`Error getting review stats: ${error.message}`);
		}
	}

	// Get all reviews with filters
	async getAllReviewsWithFilters(filters = {}, options = {}) {
		const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
		const skip = (page - 1) * limit;

		try {
			const query = {};

			if (filters.rating) {
				query.rating = filters.rating;
			}

			if (filters.productId) {
				query.product_id = filters.productId;
			}

			if (filters.userId) {
				query.user_id = filters.userId;
			}

			const reviews = await this.model
				.find(query)
				.populate('user_id', 'name email avatar')
				.populate('product_id', 'name images price')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await this.model.countDocuments(query);

			return {
				success: true,
				data: reviews,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}
}

export default new ReviewRepository();
