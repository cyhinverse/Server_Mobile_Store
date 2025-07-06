import { catchAsync } from '../../configs/catchAsync.js';

class ReviewController {
	constructor() {}
	createReview = catchAsync(async (req, res) => {
		const { userId, productId, rating, comment } = req.body;
		if (!userId || !productId || !rating) {
			return res.status(400).json({
				message: 'User ID, Product ID, and Rating are required!',
			});
		}
	});
}

export default new ReviewController();
