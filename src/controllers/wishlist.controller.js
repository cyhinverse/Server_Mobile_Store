import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../configs/catchAsync';

class WishListController {
	constructor() {
		if (WishListController.instance) return WishListController.instance;
		WishListController.instance = this;
	}
	createWishList = catchAsync(async (req, res) => {
		const { userId, productId } = req.body;
		if (!userId || !productId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID and Product ID are required',
				success: false,
			});
		}
		const wishList = await WishListService;
	});
}

export default WishListController;
