import express from 'express';
import VariantController from './variant.controller.js';
const router = express.Router();

router.post('/create', VariantController.createVariant);
router.get('/:id', VariantController.getListVariantForProduct);

export default router;
