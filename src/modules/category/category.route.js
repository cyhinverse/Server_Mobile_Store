import express from 'express';
const router = express.Router();

import CategoryController from './category.controller.js';

router.post('/', CategoryController.createCategory);

router.delete('/:id', CategoryController.deleteCategory);

router.put('/:id', CategoryController.updateCategory);

router.get('/all', CategoryController.getAllCategories);

router.get('/', CategoryController.getCategoriesPaginated);

router.get('/tree', CategoryController.getTreeCategories);

router.get('/:id', CategoryController.getCategoryById);

router.get('/slug/:slug', CategoryController.getCategoryBySlug);

export default router;
