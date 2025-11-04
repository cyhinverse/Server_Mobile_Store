import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';
import DiscountController from './discount.controller.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Get all discounts (Public - for display)
router.get('/', DiscountController.getAll);

// Get active discounts (Public)
router.get('/active', DiscountController.getDiscountByActiveStatus);

// Get inactive discounts (Admin only)
router.get(
	'/not-active',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.DISCOUNT_READ]),
	DiscountController.getDiscountByNotActiveStatus
);

// Get discount by ID (Public)
router.get('/:id', DiscountController.getById);

// Get discounts by date range (Public)
router.get('/range/date', DiscountController.getDiscountByStartAndEndDate);

// ==================== USER ROUTES (Authenticated) ====================
// Apply discount code (Authenticated users)
router.post('/apply', authMiddleware, DiscountController.applyDiscount);

// ==================== ADMIN ROUTES ====================
// Create discount (Admin only)
router.post(
	'/',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.DISCOUNT_CREATE]),
	DiscountController.create
);

// Update discount (Admin only)
router.put(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.DISCOUNT_UPDATE]),
	DiscountController.update
);

// Delete discount (Admin only)
router.delete(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.DISCOUNT_DELETE]),
	DiscountController.delete
);

export default router;
