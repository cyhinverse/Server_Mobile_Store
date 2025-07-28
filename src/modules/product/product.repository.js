import BaseRepository from '../../core/repository/base.repository.js';
import Product from './product.model.js';
import { getPaginationMeta } from '../../shared/response/pagination.js';

class ProductRepository extends BaseRepository {
	constructor() {
		super(Product);
	}

	// Tìm sản phẩm theo category
	async findByCategory(categoryId, page = 1, limit = 10) {
		try {
			const skip = (page - 1) * limit;
			const products = await this.model
				.find({ category_id: categoryId })
				.skip(skip)
				.limit(limit)
				.populate('category_id');

			const total = await this.model.countDocuments({
				category_id: categoryId,
			});

			return {
				data: products,
				pagination: {
					total,
					...getPaginationMeta(page, limit, total),
				},
			};
		} catch (error) {
			throw new Error('Error finding products by category: ' + error.message);
		}
	}

	// Tìm kiếm sản phẩm
	async searchProducts(searchInput) {
		try {
			const regex = new RegExp(searchInput, 'i');
			const products = await this.model
				.find({
					$or: [{ name: regex }, { description: regex }],
				})
				.populate('category_id');

			return products;
		} catch (error) {
			throw new Error('Error searching products: ' + error.message);
		}
	}

	// Lọc sản phẩm theo nhiều tiêu chí
	async filterProducts(filter, page = 1, limit = 10) {
		try {
			const query = {};

			if (filter.name) {
				query.name = new RegExp(filter.name, 'i');
			}

			if (filter.minPrice || filter.maxPrice) {
				query.price = {};
				if (filter.minPrice) query.price.$gte = filter.minPrice;
				if (filter.maxPrice) query.price.$lte = filter.maxPrice;
			}

			if (filter.isNewProduct !== undefined) {
				query.isNewProduct = filter.isNewProduct;
			}

			if (filter.isFeatured !== undefined) {
				query.isFeatured = filter.isFeatured;
			}

			const skip = (page - 1) * limit;
			const products = await this.model
				.find(query)
				.skip(skip)
				.limit(limit)
				.populate('category_id');

			const total = await this.model.countDocuments(query);

			return {
				data: products,
				pagination: {
					total,
					...getPaginationMeta(page, limit, total),
				},
			};
		} catch (error) {
			throw new Error('Error filtering products: ' + error.message);
		}
	}

	// Tìm sản phẩm theo slug
	async findBySlug(slug) {
		try {
			const products = await this.model
				.find({ slug: slug })
				.populate('category_id');

			return products;
		} catch (error) {
			throw new Error('Error finding products by slug: ' + error.message);
		}
	}

	// Lấy chi tiết sản phẩm
	async getProductDetails(slug) {
		try {
			const product = await this.model
				.findOne({ slug: slug })
				.populate('category_id')
				.populate('detail_id');

			return product;
		} catch (error) {
			throw new Error('Error getting product details: ' + error.message);
		}
	}

	// Kiểm tra stock
	async checkStock(productId, quantity) {
		try {
			const product = await this.model.findById(productId);
			if (!product) {
				throw new Error('Product not found');
			}

			return product.stock >= quantity;
		} catch (error) {
			throw new Error('Error checking stock: ' + error.message);
		}
	}

	// Cập nhật stock
	async updateStock(productId, quantity) {
		try {
			const product = await this.model.findById(productId);
			if (!product) {
				throw new Error('Product not found');
			}

			if (product.stock < quantity) {
				throw new Error('Insufficient stock');
			}

			const updatedProduct = await this.model.findByIdAndUpdate(
				productId,
				{
					$inc: {
						stock: -quantity,
						sold: quantity,
					},
				},
				{ new: true }
			);

			return updatedProduct;
		} catch (error) {
			throw new Error('Error updating stock: ' + error.message);
		}
	}
}

export default new ProductRepository();
