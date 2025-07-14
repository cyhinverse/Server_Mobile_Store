import express from 'express';
import { upload } from '../../configs/config.upload.js';
import ProductController from './product.controller.js';

const router = express.Router();

router.post('/create', ProductController.createProduct);
router.delete('/delete', ProductController.deleteProduct);
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:slug', ProductController.getProductDetails);
router.get('/:id', ProductController.getProductById);

export default router;
