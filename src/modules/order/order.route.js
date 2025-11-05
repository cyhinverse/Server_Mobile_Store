import express from 'express';
import OrderController from './order.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// ==================== ADMIN ROUTES (đặt trước để tránh conflict với /:id) ====================
// Get order statistics (admin)
router.get(
	'/stats',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_READ]),
	OrderController.getOrderStats
);

// Get all orders (admin)
router.get(
	'/admin/all',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_READ]),
	OrderController.getAllOrders
);

// Get orders by date range (admin)
router.get(
	'/date-range',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_READ]),
	OrderController.getOrdersByDateRange
);

// Get orders by status (admin)
router.get(
	'/status/:status',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_READ]),
	OrderController.getOrdersByStatus
);

// Get orders by user ID (admin)
router.get(
	'/user/:userId',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_READ]),
	OrderController.getOrdersByUserId
);

// ==================== USER ROUTES ====================
// Create new order (authenticated users)
router.post('/', OrderController.createOrder);

// Get current user's orders
router.get('/my-orders', OrderController.getMyOrders);

// Get order by ID (owner or admin)
router.get('/:id', OrderController.getOrderById);

// Cancel order (owner or admin)
router.patch('/:id/cancel', OrderController.cancelOrder);

// ==================== ADMIN UPDATE ROUTES ====================
// Update order status (admin)
router.patch(
	'/:id/status',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_UPDATE]),
	OrderController.updateOrderStatus
);

// Update order note (admin)
router.patch(
	'/:id/note',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_UPDATE]),
	OrderController.updateOrderNote
);

// Update payment method (admin)
router.patch(
	'/:id/payment-method',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_UPDATE]),
	OrderController.updatePaymentMethod
);

// Delete order (admin)
router.delete(
	'/:id',
	checkPermission([SYSTEM_PERMISSIONS.ORDER_DELETE]),
	OrderController.deleteOrder
);

export default router;
