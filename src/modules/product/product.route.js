import express from 'express';
import { upload } from '../../configs/config.upload.js';
import ProductController from './product.controller.js';

const router = express.Router();

router.post('/create');
router.post('/:id/delete', ProductController.deleteProduct);
router.post(
	'/:id/update',
	upload.single('image'),
	ProductController.updateProduct
);

router.get('/:id');

export default router;
