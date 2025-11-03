import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import { ReviewValidation } from './review.validation.js';
import ReviewService from './review.service.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class ReviewController {
	constructor() {
		if (ReviewController.instance) return ReviewController.instance;
		ReviewController.instance = this;
	}

	// Create a new review
	createReview = catchAsync(async (req, res) => {
		const { error, value } = ReviewValidation.create.validate(req.body, {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: true,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			// Add user ID from auth middleware
			value.userId = req.user.id;

			const newReview = await ReviewService.createReview(value);
			return formatSuccess({
				res,
				message: 'Review created successfully',
				code: StatusCodes.CREATED,
				data: newReview,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Update a review
	updateReview = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { error, value } = ReviewValidation.update.validate(req.body, {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: true,
		});

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
			});
		}

		try {
			value.id = id;
			const updatedReview = await ReviewService.updateReview(value);
			return formatSuccess({
				res,
				message: 'Review updated successfully',
				code: StatusCodes.OK,
				data: updatedReview,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Delete a review
	deleteReview = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail({
				res,
				message: 'Review ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			await ReviewService.deleteReview(id);
			return formatSuccess({
				res,
				message: 'Review deleted successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get all reviews with filters and pagination
	getAllReviews = catchAsync(async (req, res) => {
		try {
			const { page = 1, limit = 10, rating, productId, userId } = req.query;

			const filters = {};
			if (rating) filters.rating = parseInt(rating);
			if (productId) filters.productId = productId;
			if (userId) filters.userId = userId;

			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await ReviewService.getAllReviews(filters, options);
			return formatSuccess({
				res,
				message: 'Reviews retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get review by ID
	getReviewById = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail({
				res,
				message: 'Review ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const review = await ReviewService.getReviewById(id);
			return formatSuccess({
				res,
				message: 'Review retrieved successfully',
				code: StatusCodes.OK,
				data: review,
			});
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail({
					res,
					message: error.message,
					code: StatusCodes.NOT_FOUND,
				});
			}
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get reviews by product ID
	getReviewsByProductId = catchAsync(async (req, res) => {
		const { productId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!productId) {
			return formatFail({
				res,
				message: 'Product ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await ReviewService.getReviewsByProductId(
				productId,
				options
			);
			return formatSuccess({
				res,
				message: 'Product reviews retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get reviews by user ID (current user)
	getMyReviews = catchAsync(async (req, res) => {
		const userId = req.user.id;
		const { page = 1, limit = 10 } = req.query;

		try {
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await ReviewService.getReviewsByUserId(userId, options);
			return formatSuccess({
				res,
				message: 'User reviews retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get reviews by user ID (for admin)
	getReviewsByUserId = catchAsync(async (req, res) => {
		const { userId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!userId) {
			return formatFail({
				res,
				message: 'User ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const options = {
				page: parseInt(page),
				limit: parseInt(limit),
			};

			const result = await ReviewService.getReviewsByUserId(userId, options);
			return formatSuccess({
				res,
				message: 'User reviews retrieved successfully',
				code: StatusCodes.OK,
				data: result,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	// Get product review statistics
	getProductReviewStats = catchAsync(async (req, res) => {
		const { productId } = req.params;

		if (!productId) {
			return formatFail({
				res,
				message: 'Product ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const stats = await ReviewService.getProductReviewStats(productId);
			return formatSuccess({
				res,
				message: 'Product review statistics retrieved successfully',
				code: StatusCodes.OK,
				data: stats,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
}

export default new ReviewController();
