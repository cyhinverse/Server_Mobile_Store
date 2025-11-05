import { Router } from 'express';
import ReviewController from './review.controller.js';
import { ReviewValidation } from './review.validation.js';
import { validateData } from '../../middlewares/validation.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = Router();

// ==================== ADMIN ROUTES ====================
router.get(
	'/admin/all',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.REVIEW_READ]),
	ReviewController.getAllReviews
);

router.get(
	'/admin/user/:userId',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.REVIEW_READ]),
	validateData(ReviewValidation.userIdParam, 'params'),
	ReviewController.getReviewsByUserId
);

// ==================== PUBLIC ROUTES ====================
router.get(
	'/product/:productId/stats',
	validateData(ReviewValidation.productIdParam, 'params'),
	ReviewController.getProductReviewStats
);

router.get(
	'/product/:productId',
	validateData(ReviewValidation.productIdParam, 'params'),
	ReviewController.getReviewsByProductId
);

// ==================== USER STATIC ROUTES ====================
router.get('/my-reviews', authMiddleware, ReviewController.getMyReviews);

// Create review
router.post(
	'/',
	authMiddleware,
	validateData(ReviewValidation.create),
	ReviewController.createReview
);

// ==================== USER DYNAMIC ROUTES (đặt cuối) ====================
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

export default router;
