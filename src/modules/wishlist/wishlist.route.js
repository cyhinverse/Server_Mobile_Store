import { Router } from 'express';
import WishListController from './wishlist.controller.js';
import { WishListValidation } from './wishlist.validation.js';
import { validateData } from '../../middlewares/validation.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';



const router = Router();

// User routes (cần auth)
router.post(
	'/add',
	authMiddleware,
	validateData(WishListValidation.addToWishlist),
	WishListController.addToWishlist
);

router.delete(
	'/remove/:productId',
	authMiddleware,
	validateData(WishListValidation.mongoId, 'params'),
	WishListController.removeFromWishlist
);

router.get('/', authMiddleware, WishListController.getMyWishlist);

router.delete('/clear', authMiddleware, WishListController.clearWishlist);

router.post(
	'/toggle',
	authMiddleware,
	validateData(WishListValidation.addToWishlist),
	WishListController.toggleProductInWishlist
);

router.get(
	'/check/:productId',
	authMiddleware,
	validateData(WishListValidation.mongoId, 'params'),
	WishListController.checkProductInWishlist
);

router.get('/count', authMiddleware, WishListController.getWishlistCount);

// Admin routes (cần auth + admin permission)
router.get(
	'/admin/all',
	authMiddleware,
	checkPermission(['admin']),
	validateData(WishListValidation.query, 'query'),
	WishListController.getAllWishlists
);

export default router;
