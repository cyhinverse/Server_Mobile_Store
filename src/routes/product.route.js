import express from 'express';

const router = express.Router();

router.post('/create');
router.post('/:id/delete');
router.post('/:id/update');
router.get('/:id');

export default router;
