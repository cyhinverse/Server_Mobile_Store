import express from 'express';
import DiscountController from './discount.controller.js';

const router = express.Router();

router.post('/', DiscountController.createDiscount);
router.put('/:id', DiscountController.updateDiscount);
router.post('/apply', DiscountController.applyDiscount);
router.delete('/:id', DiscountController.deleteDiscount);
router.get('/', DiscountController.getDiscounts);
router.get('/active', DiscountController.getDiscountByActiveStatus);
router.get('/not-active', DiscountController.getDiscountByNotActiveStatus);
router.get('/:id', DiscountController.getDiscountById);
router.get('/range/date', DiscountController.getDiscountByStartAndEndDate);

export default router;
