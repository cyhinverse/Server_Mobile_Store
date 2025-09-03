import express from 'express';
import { upload } from '../../configs/config.upload.js';
import ProductController from './product.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { validateData } from '../../middlewares/validation.js';
import ValidationProduct from './product.validation.js';

const router = express.Router();

// ===================== STATIC ROUTES (đặt trước dynamic routes) =====================
// Thống kê và tìm kiếm
router.get('/stats', ProductController.getProductStats);
router.get('/search', ProductController.searchProducts);

// Lọc sản phẩm theo tiêu chí
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/newest', ProductController.getNewestProducts);
router.get('/popular', ProductController.getPopularProducts);

// Get products by category (đặt trước /:id để tránh conflict)
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// Sản phẩm theo slug
router.get('/by-slug/:slug', ProductController.getProductsBySlug);

// ===================== CRUD ROUTES =====================
// Create product
router.post(
	'/',
	validateData(ValidationProduct.createProduct),
	// authMiddleware,
	// checkPermission('product:create'),
	ProductController.createProduct
);

// Get all products (với phân trang)
router.get('/', ProductController.getProductsPaginated);

// ===================== DYNAMIC ROUTES (đặt sau static routes) =====================
// Get single product by ID
router.get('/:id', ProductController.getProductById);

// Update product
router.put(
	'/:id',
	authMiddleware,
	checkPermission('product:update'),
	ProductController.updateProduct
);

// Delete product
router.delete(
	'/:id',
	authMiddleware,
	checkPermission('product:delete'),
	ProductController.deleteProduct
);

// ===================== NESTED ROUTES =====================
// Product reviews
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
