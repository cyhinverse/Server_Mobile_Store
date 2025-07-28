import express from 'express';
import DiscountController from './discount.controller.js';

const router = express.Router();

router.post('/', DiscountController.create);
router.put('/:id', DiscountController.update);
router.post('/apply', DiscountController.applyDiscount);
router.delete('/:id', DiscountController.delete);
router.get('/', DiscountController.getAll);
router.get('/active', DiscountController.getDiscountByActiveStatus);
router.get('/not-active', DiscountController.getDiscountByNotActiveStatus);
router.get('/:id', DiscountController.getById);
router.get('/range/date', DiscountController.getDiscountByStartAndEndDate);

export default router;