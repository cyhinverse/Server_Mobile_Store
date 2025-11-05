import express from 'express';
import bannerController from './banner.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();

// Statistics routes (should be before parameterized routes)
router.get(
	'/stats',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BANNER_READ]),
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
	checkPermission([SYSTEM_PERMISSIONS.BANNER_READ]),
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
	checkPermission([SYSTEM_PERMISSIONS.BANNER_UPDATE]),
	bannerController.bulkUpdateBannerStatus
);

router.patch(
	'/reorder',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BANNER_UPDATE]),
	bannerController.reorderBanners
);

// Basic CRUD operations
router.post(
	'/',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BANNER_CREATE]),
	bannerController.createBanner
);

router.get('/', bannerController.getAllBanners);

router.get('/:id', bannerController.getBannerById);

router.put(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BANNER_UPDATE]),
	bannerController.updateBanner
);

router.patch(
	'/:id/position',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BANNER_UPDATE]),
	bannerController.updateBannerPosition
);

router.delete(
	'/:id',
	authMiddleware,
	checkPermission([SYSTEM_PERMISSIONS.BANNER_DELETE]),
	bannerController.deleteBanner
);

export default router;
