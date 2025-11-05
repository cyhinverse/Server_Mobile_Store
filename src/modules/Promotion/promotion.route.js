import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';
import PromotionController from './promotion.controller.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (đặt static routes trước) ====================
// Get active promotions only (Public)
router.get('/active', PromotionController.getActivePromotions);

// Get expired promotions (Public)
router.get('/expired', PromotionController.getExpiredPromotions);

// Get upcoming promotions (Public)
router.get('/upcoming', PromotionController.getUpcomingPromotions);

// Get promotions by product ID (Public)
router.get('/product/:productId', PromotionController.getPromotionsByProduct);

// Get all promotions with pagination and filtering (Public)
router.get('/', PromotionController.getAllPromotions);

// Get promotion by ID (Public) - đặt cuối để tránh conflict
router.get('/:id', PromotionController.getPromotionById);

// ==================== ADMIN ROUTES ====================
// Create a new promotion (Admin only)
router.post(
	'/',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.PROMOTION_CREATE]),
	PromotionController.createPromotion
);

// Update promotion by ID (Admin only)
router.put(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.PROMOTION_UPDATE]),
	PromotionController.updatePromotion
);

// Toggle promotion status (Admin only)
router.patch(
	'/:id/toggle',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.PROMOTION_UPDATE]),
	PromotionController.togglePromotionStatus
);

// Add products to promotion (Admin only)
router.post(
	'/:id/products',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.PROMOTION_UPDATE]),
	PromotionController.addProductsToPromotion
);

// Remove products from promotion (Admin only)
router.delete(
	'/:id/products',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.PROMOTION_UPDATE]),
	PromotionController.removeProductsFromPromotion
);

// Delete promotion by ID (Admin only)
router.delete(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.PROMOTION_DELETE]),
	PromotionController.deletePromotion
);

export default router;
