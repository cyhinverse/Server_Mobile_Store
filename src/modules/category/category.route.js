import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();
import CategoryController from './category.controller.js';

// Create category (Admin only)
router.post(
	'/',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.CATEGORY_CREATE]),
	CategoryController.createCategory
);

// Get category statistics
router.get('/stats', CategoryController.getCategoryStats);

// Get categories with pagination
router.get('/paginated', CategoryController.getCategoriesPaginated);

// Get category tree structure
router.get('/tree', CategoryController.getTreeCategories);

// Get all categories
router.get('/', CategoryController.getAllCategories);

// Get all categories (alternative endpoint)
router.get('/all', CategoryController.getAllCategories);

// Get category by slug
router.get('/slug/:slug', CategoryController.getCategoryBySlug);

// Get children categories by parent ID
router.get('/:parentId/children', CategoryController.getChildrenCategories);

// Get category by ID (Public)
router.get('/:id', CategoryController.getCategoryById);

// Update category (Admin only)
router.put(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.CATEGORY_UPDATE]),
	CategoryController.updateCategory
);

// Delete category (Admin only)
router.delete(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.CATEGORY_DELETE]),
	CategoryController.deleteCategory
);

export default router;
