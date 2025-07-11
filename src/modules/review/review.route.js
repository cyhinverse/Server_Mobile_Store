import express from 'express';
import reviewController from './review.controller';
const router = express.Router();

router.post('/create', reviewController.createReview);
router.put('/update', reviewController.updateReview);
router.delete('/delete/:id', reviewController.deleteReview);
router.get('/get/:id', reviewController.getReviewByUserId);
router.get('/get/:id', reviewController.getReviews);

export default router;
