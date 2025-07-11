import express from 'express';
import { upload } from '../../configs/config.upload.js';
import ProductController from './product.controller.js';

const router = express.Router();

router.post('/create', ProductController.createProduct);
router.post('/:id/delete', ProductController.deleteProduct);
router.post(
	'/:id/update',
	upload.single('image'),
	ProductController.updateProduct
);

export default router;
