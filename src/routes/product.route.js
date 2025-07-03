import express from 'express';
import { upload } from '../configs/config.upload';

const router = express.Router();

router.post('/create');
router.post('/:id/delete');
router.post('/:id/update', upload.single('image'), (req, res) => {
	console.log(req.file);
});
router.get('/:id');

export default router;
