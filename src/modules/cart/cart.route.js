import express from 'express';
import cartController from './cart.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';

const router = express.Router();

// Statistics routes (should be before parameterized routes)
router.get(
	'/stats',
	authMiddleware,
	checkPermission('cart:read'),
	cartController.getCartStats
);

// Pagination route
router.get('/paginated', authMiddleware, cartController.getCartsPaginated);

// Abandoned carts route
router.get(
	'/abandoned',
	authMiddleware,
	checkPermission('cart:read'),
	cartController.getAbandonedCarts
);

// Cart total route
router.get('/total/:userId', authMiddleware, cartController.getCartTotal);

// Check product in cart
router.get(
	'/check/:userId/:productId',
	authMiddleware,
	cartController.checkProductInCart
);

// User-specific cart routes
router.get('/user/:userId', authMiddleware, cartController.getCartByUserId);

// Cart operations
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
