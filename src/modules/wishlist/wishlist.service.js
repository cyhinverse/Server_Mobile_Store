import WishList from '../wishlist.model.js';

class WishlistService {
	constructor() {
		if (WishlistService.instance) return WishlistService.instancel;
		this.model = WishList;
		WishlistService.instance = this;
	}
	createWishList = async (userId, productId) => {
		if (!userId || !productId) {
			throw new Error(
				'User ID and Product ID are required to create a wishlist'
			);
		}
		const wishlist = await this.model.findOne({ user_id: userId });
		if (!wishlist) {
			const newWishList = new this.model({
				user_id: userId,
				products: [{ product_id: productId, quantity: 1 }],
			});
			return await newWishList.save();
		}
		const productExists = wishlist.products.find(
			(item) => item.product_id.toString() === productId.toString()
		);
		productExists
			? (productExists.quantity += 1)
			: wishlist.products.push({
					product_id: productId,
					quantity: 1,
			  });
		return wishlist.save();
	};
	updateWishList = async (userId, productId, quantity) => {
		if (!userId || !productId || !quantity) {
			throw new Error(
				'User ID, Product ID and Quantity are required to update a wishlist'
			);
		}
		const wishlist = await this.model.findOne({ user_id: userId });
		if (!wishlist) {
			throw new Error('Wishlist not found for this user');
		}
		const product = wishlist.products.find(
			(item) => item.product_id.toString() === productId.toString()
		);
		if (!product) {
			throw new Error('Product not found in wishlist');
		}
	};
}

export default WishlistService;
