import express from 'express';
import OrderController from './order.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();

// User routes (authenticated)
router.use(authMiddleware);

// Create new order (authenticated users)
router.post('/', OrderController.createOrder);

// Get current user's orders
router.get('/my-orders', OrderController.getMyOrders);

// Get order by ID (owner or admin)
router.get('/:id', OrderController.getOrderById);

// Cancel order (owner or admin)
router.patch('/:id/cancel', OrderController.cancelOrder);

// Admin-only routes
router.use(
	checkPermission([
		SYSTEM_PERMISSIONS.ORDER_READ,
		SYSTEM_PERMISSIONS.ORDER_UPDATE,
		SYSTEM_PERMISSIONS.ORDER_DELETE,
	])
);

// Get all orders (admin)
router.get('/', OrderController.getAllOrders);

// Get orders by user ID (admin)
router.get('/user/:userId', OrderController.getOrdersByUserId);

// Get orders by status (admin)
router.get('/status/:status', OrderController.getOrdersByStatus);

// Get orders by date range (admin)
router.get('/date-range', OrderController.getOrdersByDateRange);

// Get order statistics (admin)
router.get('/stats', OrderController.getOrderStats);

// Update order status (admin)
router.patch('/:id/status', OrderController.updateOrderStatus);

// Update order note (admin)
router.patch('/:id/note', OrderController.updateOrderNote);

// Update payment method (admin)
router.patch('/:id/payment-method', OrderController.updatePaymentMethod);

// Delete order (admin)
router.delete('/:id', OrderController.deleteOrder);

export default router;
