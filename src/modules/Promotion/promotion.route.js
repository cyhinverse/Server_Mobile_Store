import express from 'express';
import PromotionController from './promotion.controller.js';

const router = express.Router();

// Create a new promotion
router.post('/create', PromotionController.createPromotion);

// Get all promotions with pagination and filtering
router.get('/', PromotionController.getAllPromotions);

// Get active promotions only
router.get('/active', PromotionController.getActivePromotions);

// Get expired promotions
router.get('/expired', PromotionController.getExpiredPromotions);

// Get upcoming promotions
router.get('/upcoming', PromotionController.getUpcomingPromotions);

// Get promotions by product ID
router.get('/product/:productId', PromotionController.getPromotionsByProduct);

// Get promotion by ID
router.get('/:id', PromotionController.getPromotionById);

// Update promotion by ID
router.put('/:id', PromotionController.updatePromotion);

// Toggle promotion status (active/inactive)
router.patch('/:id/toggle', PromotionController.togglePromotionStatus);

// Add products to promotion
router.post('/:id/products', PromotionController.addProductsToPromotion);

// Remove products from promotion
router.delete('/:id/products', PromotionController.removeProductsFromPromotion);

// Delete promotion by ID
router.delete('/:id', PromotionController.deletePromotion);

export default router;
