import express from 'express';
const router = express.Router();

import CategoryController from './category.controller.js';

// Create category
router.post('/', CategoryController.createCategory);

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

// Get category by ID
router.get('/:id', CategoryController.getCategoryById);

// Update category
router.put('/:id', CategoryController.updateCategory);

// Delete category
router.delete('/:id', CategoryController.deleteCategory);

export default router;
