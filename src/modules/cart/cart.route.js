import express from 'express';
import cartController from './cart.controller.js';
const router = express.Router();

router.post('/add', cartController.createCart);
router.delete('/delete/:id', cartController.deleteCart);
router.put('/update/:id', cartController.updateCart);
router.get('/:userId', cartController.getCart);
router.post('/clear/:userId', cartController.clearCart);

export default router;
