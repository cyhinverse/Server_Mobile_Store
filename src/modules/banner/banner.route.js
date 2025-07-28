import express from 'express';
import bannerController from './banner.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';

const router = express.Router();

// Statistics routes (should be before parameterized routes)
router.get(
	'/stats',
	authMiddleware,
	checkPermission('banner:read'),
	bannerController.getBannerStats
);

// Pagination route
router.get('/paginated', bannerController.getBannersPaginated);

// Date range route
router.get('/date-range', bannerController.getBannersByDateRange);

// Expired banners route
router.get(
	'/expired',
	authMiddleware,
	checkPermission('banner:read'),
	bannerController.getExpiredBanners
);

// Active banners by type
router.get('/active/:type', bannerController.getActiveBannersByType);

// Banners by position
router.get('/position/:position', bannerController.getBannersByPosition);

// Bulk operations
router.patch(
	'/bulk/status',
	authMiddleware,
	checkPermission('banner:update'),
	bannerController.bulkUpdateBannerStatus
);

router.patch(
	'/reorder',
	authMiddleware,
	checkPermission('banner:update'),
	bannerController.reorderBanners
);

// Basic CRUD operations
router.post(
	'/',
	authMiddleware,
	checkPermission('banner:create'),
	bannerController.createBanner
);

router.get('/', bannerController.getAllBanners);

router.get('/:id', bannerController.getBannerById);

router.put(
	'/:id',
	authMiddleware,
	checkPermission('banner:update'),
	bannerController.updateBanner
);

router.patch(
	'/:id/position',
	authMiddleware,
	checkPermission('banner:update'),
	bannerController.updateBannerPosition
);

router.delete(
	'/:id',
	authMiddleware,
	checkPermission('banner:delete'),
	bannerController.deleteBanner
);

export default router;
