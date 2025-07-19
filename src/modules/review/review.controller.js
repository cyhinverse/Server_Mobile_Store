import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import { ReviewValidation } from './review.validation.js';
import ReviewService from './review.service.js';

class ReviewController {
	constructor() { }
	createReview = catchAsync(async (req, res) => {
		const { userId, productId, rating, comment } = req.body;
		if (!userId || !productId || !rating) {
			return res.status(400).json({
				message: 'User ID, Product ID, and Rating are required!',
			});
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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const newReview = await ReviewService.createReview(reviewData);
		if (!newReview) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Failed to create review',
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'Review created successfully',
			data: newReview,
		});
	});
	updateReview = catchAsync(async (req, res) => {
		const { id, rating, comment } = req.body;
		if (!id || !rating || comment === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'ID, Rating, and Comment are required!',
			});
		}
		const reviewData = {
			id,
			rating,
			comment,
		};
		const _ReviewValidation = ReviewValidation.update;
		const { error } = _ReviewValidation.validate(reviewData);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const updatedReview = await ReviewService.updateReview(reviewData);
		if (!updatedReview) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Failed to update review',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Review updated successfully',
			data: updatedReview,
		});
	});
	deleteReview = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Review ID is required',
			});
		}
		const deletedReview = await ReviewService.deleteReview(id);
		if (!deletedReview) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'Review not found',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Review deleted successfully',
			data: deletedReview,
		});
	});
	getReviews = catchAsync(async (req, res) => {
		const { productId } = req.params;
		if (!productId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Product ID is required',
			});
		}
		const _ReviewValidation = ReviewValidation.getReviews;
		const { error } = _ReviewValidation.validate({ productId });
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const reviews = await ReviewService.getReviewsByProductId(productId);
		if (!reviews || reviews.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No reviews found for this product',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Reviews retrieved successfully',
			data: reviews,
		});
	});
	getReviewByUserId = catchAsync(async (req, res) => {
		const { _id } = req.user;
		if (!_id) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID is required',
			});
		}
		const _ReviewValidation = ReviewValidation.getReviewById;
		const { error } = _ReviewValidation.validate({ id: _id });
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const reviews = await ReviewService.getReviewsByUserId(_id);
		if (!reviews || reviews.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No reviews found for this user',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'User reviews retrieved successfully',
			data: reviews,
		});
	});
}

export default new ReviewController();