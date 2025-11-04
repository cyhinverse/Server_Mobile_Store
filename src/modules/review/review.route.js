import { Router } from 'express';
import ReviewController from './review.controller.js';
import { ReviewValidation } from './review.validation.js';
import { validateData } from '../../middlewares/validation.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';

const router = Router();

// User routes (cần auth)
router.post(
	'/',
	authMiddleware,
	validateData(ReviewValidation.create),
	ReviewController.createReview
);

router.get('/my-reviews', authMiddleware, ReviewController.getMyReviews);

router.get(
	'/:id',
	authMiddleware,
	validateData(ReviewValidation.mongoId, 'params'),
	ReviewController.getReviewById
);

router.put(
	'/:id',
	authMiddleware,
	validateData(ReviewValidation.mongoId, 'params'),
	validateData(ReviewValidation.update),
	ReviewController.updateReview
);

router.delete(
	'/:id',
	authMiddleware,
	validateData(ReviewValidation.mongoId, 'params'),
	ReviewController.deleteReview
);

// Product review routes (public)
router.get(
	'/product/:productId',
	validateData(ReviewValidation.productIdParam, 'params'),
	ReviewController.getReviewsByProductId
);

router.get(
	'/product/:productId/stats',
	validateData(ReviewValidation.productIdParam, 'params'),
	ReviewController.getProductReviewStats
);

// Admin routes (cần auth + admin permission)
router.get(
	'/admin/all',
	authMiddleware,
	checkPermission(['admin', 'reviews.moderate']),
	ReviewController.getAllReviews
);

router.get(
	'/admin/user/:userId',
	authMiddleware,
	checkPermission(['admin', 'reviews.moderate']),
	validateData(ReviewValidation.userIdParam, 'params'),
	ReviewController.getReviewsByUserId
);

export default router;
