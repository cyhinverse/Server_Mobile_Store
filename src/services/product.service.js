import Product from '../models/product.model';

class ProductService {
	constructor() {
		this.Product = Product;
	}

	async creatProduct(productData) {
		if (!productData || productData === null) {
			throw new Error('Product data is required');
		}
		const newProduct = new this.Product(productData);
		return await newProduct.save();
	}
	async deleteProduct(productId) {
		if (!productId || productId === undefined) {
			throw new Error('Product ID is required');
		}
		const productExists = await this.Product.findOne({ _id: productId });
		if (!productExists || productExists === null) {
			throw new Error('Product not found');
		}
		return await this.Product.deleteOne({ _id: productId });
	}
}

export default new ProductService();
