import WishList from './wishlist.model.js';

class WishlistService {
	constructor() {
		if (WishlistService.instance) return WishlistService.instancel;
		this.model = WishList;
		WishlistService.instance = this;
	}
	async createWishList(userId, productId) {
		if (!userId || !productId) {
			throw new Error(
				'User Id and product Id are required to create a wishlist'
			);
		}
		const existingWishList = await this.model.findOne({
			user_id: userId,
			products: { $elemMatch: { product_id: productId } },
		});
		if (existingWishList) {
			throw new Error('Wishlist already exists for this user and product');
		}
		const newWishList = new this.model({
			user_id: userId,
			product_id: productId,
		});
		await newWishList.save();
		return newWishList;
	}
	async updateWishList(userId, productId) {
		if (!userId || !productId) {
			throw new Error('User ID, Product ID are required to update a wishlist');
		}
		const wishlist = await this.model.findOne({ user_id: userId });
		if (!wishlist) {
			throw new Error('Wishlist not found for this user');
		}
		const productIndex = wishlist.products.some(
			(item) => item.product_id.toString() === productId
		);
		if (!productIndex) {
			wishlist.products.push({ product_id: productId });
		} else {
			wishlist.products = wishlist.products.filter(
				(item) => item.product_id.toString() !== productId
			);
		}
		await wishlist.save();
		return wishlist;
	}
	async deleteItem(userId, productId) {
		if (!userId || !productId) {
			throw new Error(
				'User ID and Product ID are required to delete an item from wishlist'
			);
		}
		const wishlist = await this.model.findOne({ user_id: userId });
		if (!wishlist) {
			throw new Error('Wishlist not found for this user');
		}
		wishlist.products = wishlist.products.filter(
			(item) => item.product_id.toString() !== productId
		);
		await wishlist.save();
		return wishlist;
	}
	async clearWishList(userId) {
		if (!userId) {
			throw new Error('User ID is required to clear the wishlist');
		}
		const wishList = await this.model.findOne({ user_id: userId });

		if (!wishList) {
			throw new Error('Wishlist not found for this user');
		}
		wishList.products.splice(0, wishList.products.length);
		await wishList.save();
	}
	async getWishListById(userId) {
		return await this.model
			.findById(userId)
			.populate(
				'products.product_id',
				'name price thumbnail stock sold status'
			);
	}
}

export default new WishlistService();
