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
	constructor() {}
	createReview = catchAsync(async (req, res) => {
		const { userId, productId, rating, comment } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Review data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		if (!userId || !productId || !rating) {
			return formatFail(
				res,
				'User ID, Product ID, and Rating are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const reviewData = {
			userId,
			productId,
			rating,
			comment,
		};

		const _ReviewValidation = ReviewValidation.create;
		const { error } = _ReviewValidation.validate(reviewData);

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const newReview = await ReviewService.createReview(reviewData);

		if (!newReview) {
			return formatError(
				res,
				'Failed to create review',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Review created successfully',
			newReview,
			StatusCodes.CREATED
		);
	});
	updateReview = catchAsync(async (req, res) => {
		const { id, rating, comment } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Review data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		if (!id || !rating || comment === undefined) {
			return formatFail(
				res,
				'ID, Rating, and Comment are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const reviewData = {
			id,
			rating,
			comment,
		};

		const _ReviewValidation = ReviewValidation.update;
		const { error } = _ReviewValidation.validate(reviewData);

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const updatedReview = await ReviewService.updateReview(reviewData);

		if (!updatedReview) {
			return formatFail(
				res,
				'Review not found or update failed',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Review updated successfully',
			updatedReview,
			StatusCodes.OK
		);
	});
	deleteReview = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input
		if (!id) {
			return formatFail(res, 'Review ID is required', StatusCodes.BAD_REQUEST);
		}

		const deletedReview = await ReviewService.deleteReview(id);

		if (!deletedReview) {
			return formatFail(res, 'Review not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Review deleted successfully',
			deletedReview,
			StatusCodes.OK
		);
	});
	getReviews = catchAsync(async (req, res) => {
		const { productId } = req.params;

		// Validate input
		if (!productId) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		const _ReviewValidation = ReviewValidation.getReviews;
		const { error } = _ReviewValidation.validate({ productId });

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const reviews = await ReviewService.getReviewsByProductId(productId);

		if (!reviews || reviews.length === 0) {
			return formatFail(
				res,
				'No reviews found for this product',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Reviews retrieved successfully',
			reviews,
			StatusCodes.OK
		);
	});
	getReviewByUserId = catchAsync(async (req, res) => {
		const { _id } = req.user;

		// Validate input
		if (!_id) {
			return formatFail(res, 'User ID is required', StatusCodes.BAD_REQUEST);
		}

		const _ReviewValidation = ReviewValidation.getReviewById;
		const { error } = _ReviewValidation.validate({ id: _id });

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const reviews = await ReviewService.getReviewsByUserId(_id);

		if (!reviews || reviews.length === 0) {
			return formatFail(
				res,
				'No reviews found for this user',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'User reviews retrieved successfully',
			reviews,
			StatusCodes.OK
		);
	});
}

export default new ReviewController();
