import productRepository from './product.repository.js';
class ProductService {
	constructor() {
		if (ProductService.instance) return ProductService.instance;
		ProductService.instance = this;
		this.productRepo = productRepository;
	}
	async createProduct(productData) {
		if (!productData) {
			throw new Error('Product data is required');
		}
		if (!productData.name) {
			throw new Error('Product name is required');
		}
		if (!productData.category_id) {
			throw new Error('Category ID is required');
		}
		if (!productData.brand_id) {
			throw new Error('Brand ID is required');
		}
		const existingProduct = await this.productRepo.findAll({
			name: productData.name,
		});
		if (existingProduct.data.length > 0) {
			throw new Error('Product with this name already exists');
		}
		const processedData = {
			...productData,
			stock: productData.stock || 0,
			sold: productData.sold || 0,
			isNewProduct: productData.isNewProduct || false,
			status: productData.status || 'active',
			createdAt: new Date(),
		};
		return await this.productRepo.create(processedData);
	}
	async deleteProduct(id) {
		if (!id) {
			throw new Error('Product ID is required');
		}
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new Error('Product not found');
		}
		return await this.productRepo.delete(id);
	}
	async updateProduct(id, productData) {
		if (!id || !productData) {
			throw new Error('Product ID and data are required');
		}
		const existingProduct = await this.productRepo.findById(id);
		if (!existingProduct) {
			throw new Error('Product not found');
		}
		const processedData = {
			...productData,
			updatedAt: new Date(),
		};
		return await this.productRepo.update(id, processedData);
	}
	async getAllProducts(page = 1, limit = 10) {
		const validPage = Math.max(1, parseInt(page));
		const validLimit = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page

		const skip = (validPage - 1) * validLimit;
		const products = await this.productRepo.model
			.find({})
			.populate('category_id', 'name slug')
			.populate('brand_id', 'name logo')
			.skip(skip)
			.limit(validLimit)
			.lean();

		const total = await this.productRepo.countDocuments({});

		// Format dữ liệu để có category và brand thay vì category_id và brand_id
		const formattedProducts = products.map((product) => ({
			...product,
			category: product.category_id,
			brand: product.brand_id,
		}));

		if (!formattedProducts.length) {
			throw new Error('No products found');
		}

		return {
			data: formattedProducts,
			pagination: {
				page: validPage,
				pageSize: validLimit,
				totalItems: total,
				totalPages: Math.ceil(total / validLimit),
				hasNextPage: validPage < Math.ceil(total / validLimit),
				hasPrevPage: validPage > 1,
			},
		};
	}
	async getProductById(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		return product;
	}
	async getProductByCategory(categoryId, page = 1, limit = 10) {
		if (!categoryId) {
			throw new Error('Category ID is required');
		}
		const validPage = Math.max(1, parseInt(page));
		const validLimit = Math.min(100, Math.max(1, parseInt(limit)));
		const result = await this.productRepo.findByCategory(
			categoryId,
			validPage,
			validLimit
		);
		if (!result.data.length) {
			throw new Error('No products found for this category');
		}
		return result;
	}
	async searchProducts(input) {
		if (!input || input.trim() === '') {
			throw new Error('Search input is required');
		}
		const cleanInput = input.trim();
		const products = await this.productRepo.searchProducts(cleanInput);
		if (!products.length) {
			throw new Error('No products found matching the search criteria');
		}
		return products;
	}
	async filterProducts(filter, page = 1, limit = 10) {
		if (!filter || typeof filter !== 'object') {
			throw new Error('Filter criteria is required');
		}
		const processedFilter = { ...filter };
		if (processedFilter.isNewProduct !== undefined) {
			processedFilter.isNewProduct =
				processedFilter.isNewProduct === 'true' ||
				processedFilter.isNewProduct === true;
		}
		if (processedFilter.isFeatured !== undefined) {
			processedFilter.isFeatured =
				processedFilter.isFeatured === 'true' ||
				processedFilter.isFeatured === true;
		}
		if (processedFilter.minPrice && processedFilter.maxPrice) {
			if (
				parseFloat(processedFilter.minPrice) >
				parseFloat(processedFilter.maxPrice)
			) {
				throw new Error('Minimum price cannot be greater than maximum price');
			}
		}
		const validPage = Math.max(1, parseInt(page));
		const validLimit = Math.min(100, Math.max(1, parseInt(limit)));
		const result = await this.productRepo.filterProducts(
			processedFilter,
			validPage,
			validLimit
		);
		if (!result.data.length) {
			throw new Error('No products found matching the filter criteria');
		}
		return result;
	}
	async getProductsBySlug(slug) {
		if (!slug || slug.trim() === '') {
			throw new Error('Slug is required');
		}
		const cleanSlug = slug.trim().toLowerCase();
		const products = await this.productRepo.findBySlug(cleanSlug);
		if (!products.length) {
			throw new Error('No products found for this slug');
		}
		return products;
	}
	async getProductDetails(slug) {
		if (!slug || slug.trim() === '') {
			throw new Error('Slug is required');
		}
		const cleanSlug = slug.trim().toLowerCase();
		const productDetails = await this.productRepo.getProductDetails(cleanSlug);
		if (!productDetails) {
			throw new Error('Product details not found');
		}
		return productDetails;
	}
	async checkStock(productId, quantity) {
		if (!productId || !quantity) {
			throw new Error('Product ID and quantity are required');
		}
		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}
		const isAvailable = await this.productRepo.checkStock(productId, quantity);
		if (!isAvailable) {
			throw new Error('Insufficient stock for the requested product');
		}
		return true;
	}
	async updateStock(productId, quantity) {
		if (!productId || !quantity) {
			throw new Error('Product ID and quantity are required');
		}
		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}
		return await this.productRepo.updateStock(productId, quantity);
	}
	async createVariantForProduct(productId, variantData) {
		if (!productId || !variantData) {
			throw new Error('Product ID and variant data are required');
		}
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		if (!variantData.color || !variantData.storage || !variantData.price) {
			throw new Error('Variant must have color, storage, and price');
		}
		const updatedProduct = await this.productRepo.update(productId, {
			$push: { variants: { ...variantData, createdAt: new Date() } },
		});
		return updatedProduct;
	}
	async getListVariantForProduct(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		const variants = product.variants || [];
		if (variants.length === 0) {
			throw new Error('No variants found for this product');
		}
		return variants;
	}
	async getVariantById(variantId) {
		if (!variantId) {
			throw new Error('Variant ID is required');
		}
		const products = await this.productRepo.findAll({
			'variants._id': variantId,
		});
		if (!products.data.length) {
			throw new Error('Variant not found');
		}
		const product = products.data[0];
		const variant = product.variants.find(
			(v) => v._id.toString() === variantId
		);
		return variant;
	}
	async updateVariantForProduct(productId, variantData) {
		if (!productId || !variantData) {
			throw new Error('Product ID and variant data are required');
		}
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		return await this.productRepo.update(productId, {
			variants: variantData,
			updatedAt: new Date(),
		});
	}
	async deleteVariantForProduct(variantId) {
		if (!variantId) {
			throw new Error('Variant ID is required');
		}
		const products = await this.productRepo.findAll({
			'variants._id': variantId,
		});
		if (!products.data.length) {
			throw new Error('Variant not found');
		}
		const product = products.data[0];
		const updatedVariants = product.variants.filter(
			(v) => v._id.toString() !== variantId
		);
		return await this.productRepo.update(product._id, {
			variants: updatedVariants,
			updatedAt: new Date(),
		});
	}
	async getVariantByProductId(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		if (!product.variants || product.variants.length === 0) {
			throw new Error('Variant not found for this product');
		}
		return product.variants;
	}
	async checkAndUpdateStock(variantId, quantity) {
		if (!variantId || !quantity) {
			throw new Error('Variant ID and quantity are required');
		}
		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}
		const products = await this.productRepo.findAll({
			'variants._id': variantId,
		});
		if (!products.data.length) {
			throw new Error('Variant not found');
		}
		const product = products.data[0];
		const variant = product.variants.find(
			(v) => v._id.toString() === variantId
		);
		if (!variant) {
			throw new Error('Variant not found');
		}
		if (variant.stock < quantity) {
			throw new Error('Insufficient variant stock');
		}
		variant.stock -= quantity;
		variant.sold = (variant.sold || 0) + quantity;
		await this.productRepo.update(product._id, {
			variants: product.variants,
			updatedAt: new Date(),
		});
		return variant;
	}
	async getProductStats() {
		const totalProducts = await this.productRepo.countDocuments({});
		const activeProducts = await this.productRepo.countDocuments({
			status: 'active',
		});
		const inactiveProducts = await this.productRepo.countDocuments({
			status: 'inactive',
		});
		const featuredProducts = await this.productRepo.countDocuments({
			isFeatured: true,
		});
		return {
			totalProducts,
			activeProducts,
			inactiveProducts,
			featuredProducts,
		};
	}
	async getProductsPaginated(options) {
		const { page, limit, sort, order } = options;
		const sortObj = {};
		sortObj[sort] = order === 'desc' ? -1 : 1;

		// Sử dụng trực tiếp model để có thể populate
		const skip = (page - 1) * limit;
		const products = await this.productRepo.model
			.find({})
			.populate('category_id', 'name slug')
			.populate('brand_id', 'name logo')
			.sort(sortObj)
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await this.productRepo.countDocuments({});

		// Format dữ liệu để có category và brand thay vì category_id và brand_id
		const formattedProducts = products.map((product) => ({
			...product,
			category: product.category_id,
			brand: product.brand_id,
		}));

		return {
			products: {
				data: formattedProducts,
				pagination: {
					page,
					pageSize: limit,
					totalItems: total,
					totalPages: Math.ceil(total / limit),
					hasNextPage: page < Math.ceil(total / limit),
					hasPrevPage: page > 1,
				},
			},
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}
	async getProductsByCategory(categoryId, options = {}) {
		const { page = 1, limit = 10 } = options;
		const skip = (page - 1) * limit;
		const products = await this.productRepo.findAll(
			{ categoryId },
			{ skip, limit, sort: { createdAt: -1 } }
		);
		const total = await this.productRepo.countDocuments({ categoryId });
		return {
			data: products.data,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}
	async getFeaturedProducts(limit = 10) {
		const products = await this.productRepo.findAll(
			{ isFeatured: true, status: 'active' },
			{ limit, sort: { createdAt: -1 } }
		);
		return products.data;
	}
	async getNewestProducts(limit = 10) {
		const products = await this.productRepo.findAll(
			{ status: 'active' },
			{ limit, sort: { createdAt: -1 } }
		);
		return products.data;
	}
	async getPopularProducts(limit = 10) {
		const products = await this.productRepo.findAll(
			{ status: 'active' },
			{ limit, sort: { sold: -1, views: -1 } }
		);
		return products.data;
	}
	async getProductBySlug(slug) {
		const products = await this.productRepo.findAll({ slug });
		return products.data.length > 0 ? products.data[0] : null;
	}
	async getProductReviews(productId, options = {}) {
		const { page = 1, limit = 10 } = options;
		return {
			data: [],
			pagination: {
				page,
				limit,
				total: 0,
				pages: 0,
			},
		};
	}
	async addProductReview(reviewData) {
		return {
			...reviewData,
			_id: new Date().getTime().toString(),
			createdAt: new Date(),
		};
	}
	async addProductImages(productId, images) {
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		const imagePaths = images.map((image) => ({
			_id: new Date().getTime().toString() + Math.random(),
			path: image.path,
			filename: image.filename,
			originalname: image.originalname,
		}));
		const currentImages = product.images || [];
		const updatedImages = [...currentImages, ...imagePaths];
		await this.productRepo.update(productId, {
			images: updatedImages,
			updatedAt: new Date(),
		});
		return imagePaths;
	}
	async deleteProductImage(productId, imageId) {
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}
		const images = product.images || [];
		const updatedImages = images.filter((img) => img._id !== imageId);
		if (images.length === updatedImages.length) {
			throw new Error('Image not found');
		}
		await this.productRepo.update(productId, {
			images: updatedImages,
			updatedAt: new Date(),
		});
		return true;
	}
}
export default new ProductService();
