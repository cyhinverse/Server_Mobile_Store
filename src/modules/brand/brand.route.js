import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();
import BrandController from './brand.controller.js';

// Create a new brand (Admin only)
router.post(
	'/',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BRAND_CREATE]),
	BrandController.create
);

// Delete a brand by ID (Admin only)
router.delete(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BRAND_DELETE]),
	BrandController.delete
);

// Update a brand by ID (Admin only)
router.put(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BRAND_UPDATE]),
	BrandController.update
);

// Get only active brands (đặt static routes trước)
router.get('/active', BrandController.getActiveBrands);

// Get brands with pagination and search
router.get('/', BrandController.getBrandsPaginated);

// Get a brand by name
router.get('/name/:name', BrandController.getBrandByName);

// Get a brand by ID (đặt cuối để tránh conflict)
router.get('/:id', BrandController.getById);

// Toggle brand status (Admin only)
router.patch(
	'/:id/toggle-status',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BRAND_UPDATE]),
	BrandController.toggleBrandStatus
);

export default router;
