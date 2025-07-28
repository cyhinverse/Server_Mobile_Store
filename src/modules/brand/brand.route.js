import express from 'express';
const router = express.Router();

import BrandController from './brand.controller.js';

// Create a new brand
router.post('/', BrandController.create);

// Delete a brand by ID
router.delete('/:id', BrandController.delete);

// Update a brand by ID
router.put('/:id', BrandController.update);

// Toggle brand status (active/inactive)
router.patch('/:id/toggle-status', BrandController.toggleBrandStatus);

// Get all brands
router.get('/all', BrandController.getAll);

// Get only active brands
router.get('/active', BrandController.getActiveBrands);

// Get brands with pagination and search
router.get('/', BrandController.getBrandsPaginated);

// Get a brand by ID
router.get('/:id', BrandController.getById);

// Get a brand by name
router.get('/name/:name', BrandController.getBrandByName);

export default router;