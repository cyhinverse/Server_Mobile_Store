import express from 'express';
import { upload } from '../../configs/config.upload.js';
import ProductController from './product.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';

const router = express.Router();

// Thống kê và tìm kiếm (đặt trước để tránh conflict với /:id)
router.get('/stats', ProductController.getProductStats);
router.get('/search', ProductController.searchProducts);
router.get('/paginated', ProductController.getProductsPaginated);

// Lọc sản phẩm (đặt trước /:id)
router.get('/category/:categoryId', ProductController.getProductsByCategory);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/newest', ProductController.getNewestProducts);
router.get('/popular', ProductController.getPopularProducts);

// Sản phẩm theo slug (đặt trước /:id)
router.get('/by-slug/:slug', ProductController.getProductsBySlug);

// CRUD cơ bản
router.post(
	'/',
	authMiddleware,
	checkPermission('product:create'),
	ProductController.createProduct
);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.put(
	'/:id',
	authMiddleware,
	checkPermission('product:update'),
	ProductController.updateProduct
);
router.delete(
	'/:id',
	authMiddleware,
	checkPermission('product:delete'),
	ProductController.deleteProduct
);

// Đánh giá sản phẩm
router.get('/:id/reviews', ProductController.getProductReviews);
router.post('/:id/reviews', authMiddleware, ProductController.addProductReview);

// Quản lý hình ảnh
router.post(
	'/:id/images',
	authMiddleware,
	checkPermission('product:update'),
	upload.array('images'),
	ProductController.addProductImages
);
router.delete(
	'/:id/images/:imageId',
	authMiddleware,
	checkPermission('product:update'),
	ProductController.deleteProductImage
);

export default router;
