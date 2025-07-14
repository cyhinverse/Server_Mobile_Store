import Product from './product.model.js';

class ProductService {
	constructor() {
		if (ProductService.instance) return ProductService.instance;
		this.model = Product;
		ProductService.instance = this;
	}

	async createProduct(productData) {
		if (!productData) {
			throw new Error('Product data is required');
		}
		const newProduct = await this.model.create(productData);
		if (!newProduct || newProduct === null) {
			throw new Error('Failed to create product');
		}
		return await newProduct.save();
	}
	async deleteProduct(id) {
		if (!id) {
			throw new Error('Product ID is required');
		}
		const productExists = await this.model.findById(id);

		if (!productExists) {
			throw new Error('Product not found');
		}
		return await this.model.findByIdAndDelete(id);
	}
	async updateProduct(data) {
		if (!data) {
			throw new Error('Product data is required');
		}
		const { id, ...productData } = data;
		if (!id) {
			throw new Error('Product ID is required');
		}
		const productExists = await this.model.findById(id);
		if (!productExists) {
			throw new Error('Product not found');
		}
		return await this.model.findByIdAndUpdate(id, productData, { new: true });
	}
	async getAllProducts() {
		const products = await this.model.find();
		if (!products.length) {
			throw new Error('No products found');
		}
		return products;
	}
	async getProductByCategory(categoryId) {
		if (!categoryId) {
			throw new Error('Category ID is required');
		}
		const products = await this.model.find({ category_id: categoryId });
		if (!products.length) {
			throw new Error('No products found for this category');
		}
		return products;
	}
	async searchProducts(input) {
		if (!input || input.trim() === '') {
			throw new Error('Search input is required');
		}
		const regex = new RegExp(input, 'i');
		const products = await this.model.find({ name: { $regex: regex } });
		if (!products.length) {
			throw new Error('No products found matching the search criteria');
		}
		return products;
	}
	async getProductById(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}
		const product = await this.model.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		return product;
	}
	async filterProducts(filter, page = 1, limit = 10) {
		if (!filter) {
			throw new Error('Filter criteria is required');
		}

		const {
			name,
			maxPrice,
			minPrice,
			isNewProduct,
			color,
			rating,
			isFeatured,
			storage,
			chipset,
			ram,
			battery,
			os,
		} = filter;

		const query = {};

		// Tìm theo tên
		if (name) {
			query.name = { $regex: new RegExp(name, 'i') };
		}

		// Tìm theo khoảng giá
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = minPrice;
			if (maxPrice) query.price.$lte = maxPrice;
		}

		// Cờ isNewProduct và isFeatured
		if (isNewProduct !== undefined) {
			query.isNewProduct = isNewProduct;
		}
		if (isFeatured !== undefined) {
			query.isFeatured = isFeatured;
		}

		// Gộp điều kiện trong variants (color, storage)
		const variantMatch = {};
		if (color) {
			const arrayColor = Array.isArray(color) ? color : color.split(',');
			variantMatch.color = { $in: arrayColor };
		}
		if (storage) {
			const arrayStorage = Array.isArray(storage)
				? storage
				: storage.split(',');
			variantMatch.storage = { $in: arrayStorage };
		}
		if (Object.keys(variantMatch).length > 0) {
			query['product_detail.variants'] = { $elemMatch: variantMatch };
		}

		// Rating
		if (rating) {
			query.rating = { $gte: rating };
		}

		// Các thuộc tính specs
		if (chipset) {
			query['product_detail.specs.chipset'] = chipset;
		}
		if (ram) {
			query['product_detail.specs.ram'] = ram;
		}
		if (battery) {
			query['product_detail.specs.battery'] = battery;
		}
		if (os) {
			query['product_detail.specs.os'] = os;
		}

		const skip = (page - 1) * limit;

		const [products, total] = await Promise.all([
			this.model.find(query).skip(skip).limit(limit),
			this.model.countDocuments(query),
		]);

		if (!products.length) {
			throw new Error('No products found matching the filter criteria');
		}

		return {
			products,
			total,
			page,
			limit,
		};
	}
	async getProductDetails(slug) {
		if (!slug || slug.trim() === '') {
			throw new Error('Slug is required');
		}
		const products = await this.model.find({ slug: slug });
		if (!products.length) {
			throw new Error('No products found for this slug');
		}
		return products;
	}
	async updateProduct(id, data) {
		if (!id || !data) {
			throw new Error('Product ID and data are required');
		}

		const product = await this.model.findById(id);
		if (!product) {
			throw new Error('Product not found');
		}

		if (Array.isArray(data)) {
			const updated = await this.model.findByIdAndUpdate(
				id,
				{ 'productDetail.variants': data },
				{ new: true }
			);
			if (!updated) throw new Error('Failed to update product variants');
			return updated;
		}

		if (typeof data === 'object') {
			const updated = await this.model.findByIdAndUpdate(
				id,
				{ productDetail: data },
				{ new: true }
			);
			if (!updated) throw new Error('Failed to update product details');
			return updated;
		}

		const updated = await this.model.findByIdAndUpdate(id, data, {
			new: true,
		});
		if (!updated) throw new Error('Failed to update product');
		return updated;
	}
	async checkStock(productId, quantity) {
		if (!productId || !quantity) {
			throw new Error('Product ID and quantity are required');
		}
		const product = await this.model.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		const stock = product.stock || 0;
		if (stock < quantity) {
			throw new Error('Insufficient stock for the requested product');
		}
		return true;
	}
	async deductStock(productId, quantity) {
		if (!productId || !quantity) {
			throw new Error('Product ID and quantity are required');
		}
		const product = await this.model.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		if (product.stock < quantity) {
			throw new Error('Insufficient stock to deduct');
		}
		product.stock -= quantity;
		const updatedProduct = await product.save();
		if (!updatedProduct) {
			throw new Error('Failed to deduct stock');
		}
		return updatedProduct;
	}
}

export default new ProductService();
