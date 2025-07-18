import express from 'express';
import BannerController from './banner.controller';

const router = express.Router();

// Routes
router.post('/', BannerController.createBanner);
router.get('/', BannerController.getAllBanners);
router.get('/active', BannerController.getActiveBanners);
router.put('/:id', BannerController.updateBanner);
router.delete('/:id', BannerController.deleteBanner);
router.post('/reorder', BannerController.reorderBanner); // 👈 Reorder route

export default router;
