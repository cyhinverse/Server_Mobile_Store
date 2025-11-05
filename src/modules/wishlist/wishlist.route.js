import { Router } from 'express';
import WishListController from './wishlist.controller.js';
import { WishListValidation } from './wishlist.validation.js';
import { validateData } from '../../middlewares/validation.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = Router();

// ==================== ADMIN ROUTES ====================
router.get(
	'/admin/all',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.WISHLIST_READ]),
	validateData(WishListValidation.query, 'query'),
	WishListController.getAllWishlists
);

// ==================== USER STATIC ROUTES (đặt trước dynamic routes) ====================
// Add to wishlist
router.post(
	'/add',
	authMiddleware,
	validateData(WishListValidation.addToWishlist),
	WishListController.addToWishlist
);

// Toggle product in wishlist
router.post(
	'/toggle',
	authMiddleware,
	validateData(WishListValidation.addToWishlist),
	WishListController.toggleProductInWishlist
);

// Clear wishlist
router.delete('/clear', authMiddleware, WishListController.clearWishlist);

// Get wishlist count
router.get('/count', authMiddleware, WishListController.getWishlistCount);

// Get my wishlist
router.get('/', authMiddleware, WishListController.getMyWishlist);

// ==================== USER DYNAMIC ROUTES (đặt cuối) ====================
// Check if product in wishlist
router.get(
	'/check/:productId',
	authMiddleware,
	validateData(WishListValidation.mongoId, 'params'),
	WishListController.checkProductInWishlist
);

// Remove from wishlist
router.delete(
	'/remove/:productId',
	authMiddleware,
	validateData(WishListValidation.mongoId, 'params'),
	WishListController.removeFromWishlist
);

export default router;
