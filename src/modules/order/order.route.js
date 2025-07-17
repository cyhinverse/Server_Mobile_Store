import express from 'express';
import OrderController from './order.controller';
const router = express.Router();

router.post('/', OrderController.createOrder);
router.delete('/:id', OrderController.deleteOrder);
router.patch('/:id/status', OrderController.updateStatus);
router.patch('/:id/note', OrderController.updateNote);
router.patch('/:id/cancel', OrderController.cancelOrder);
router.get('/:id', OrderController.getOrderById);
router.get('/user/:userId', OrderController.getOrderByUserId);
router.get('/', OrderController.getAllOrders);
router.get('/status/:status', OrderController.getOrdersByStatus);
router.patch('/:id/payment-method', OrderController.updatePayementMethod);

export default router;
