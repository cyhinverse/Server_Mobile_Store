import express from 'express';
import cartController from './cart.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();

// ==================== ADMIN ROUTES (Statistics & Management) ====================
// Statistics routes (Admin only - requires cart:read permission)
router.get(
	'/stats',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.CART_READ]),
	cartController.getCartStats
);

// Pagination route (Admin only)
router.get(
	'/paginated',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.CART_READ]),
	cartController.getCartsPaginated
);

// Abandoned carts route (Admin only)
router.get(
	'/abandoned',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.CART_READ]),
	cartController.getAbandonedCarts
);

// ==================== USER ROUTES (Authenticated Users) ====================
// Cart total route (Own cart only)
router.get('/total/:userId', authMiddleware, cartController.getCartTotal);

// Check product in cart (Own cart only)
router.get(
	'/check/:userId/:productId',
	authMiddleware,
	cartController.checkProductInCart
);

// User-specific cart routes (Own cart only)
router.get('/user/:userId', authMiddleware, cartController.getCartByUserId);

// Cart operations (Authenticated users - own cart only)
router.post('/', authMiddleware, cartController.addToCart);

router.put('/quantity', authMiddleware, cartController.updateCartQuantity);

router.patch('/decrease', authMiddleware, cartController.decreaseQuantity);

router.delete('/item', authMiddleware, cartController.removeFromCart);

router.delete(
	'/bulk/remove',
	authMiddleware,
	cartController.bulkRemoveFromCart
);

router.delete('/clear/:userId', authMiddleware, cartController.clearCart);

export default router;
