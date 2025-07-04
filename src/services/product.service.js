import product from '../models/product.model.js';

class ProductService {
	constructor() {
		if (ProductService.instance) return ProductService.instance;
		this.model = product;
		ProductService.instance = this;
	}

	async createProduct(productData) {
		if (!productData) {
			throw new Error('Product data is required');
		}
		const newProduct = new this.model(productData);
		return await newProduct.save();
	}

	async deleteProduct(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}
		const productExists = await this.model.findById(productId);
		if (!productExists) {
			throw new Error('Product not found');
		}
		return await this.model.findByIdAndDelete(productId);
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
			isNew,
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

		// Cờ isNew và isFeatured
		if (isNew !== undefined) {
			query.isNew = isNew;
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

	async getProductsBySlug(slug) {
		if (!slug || slug.trim() === '') {
			throw new Error('Slug is required');
		}
		const products = await this.model.find({ slug: slug });
		if (!products.length) {
			throw new Error('No products found for this slug');
		}
		return products;
	}
}

export default new ProductService();
