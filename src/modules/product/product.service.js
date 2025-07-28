import productRepository from './product.repository.js';

class ProductService {
	constructor() {
		if (ProductService.instance) return ProductService.instance;
		ProductService.instance = this;
		this.productRepo = productRepository;
	}

	async createProduct(productData) {
		// Business logic: Validate product data
		if (!productData) {
			throw new Error('Product data is required');
		}

		// Business logic: Check if product name already exists
		const existingProduct = await this.productRepo.findAll({
			name: productData.name,
		});
		if (existingProduct.data.length > 0) {
			throw new Error('Product with this name already exists');
		}

		// Business logic: Set default values
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
		// Business logic: Validate ID
		if (!id) {
			throw new Error('Product ID is required');
		}

		// Business logic: Check if product exists
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new Error('Product not found');
		}

		// Business logic: Check if product has pending orders (if needed)
		// Add your business logic here

		return await this.productRepo.delete(id);
	}

	async updateProduct(id, productData) {
		// Business logic: Validate inputs
		if (!id || !productData) {
			throw new Error('Product ID and data are required');
		}

		// Business logic: Check if product exists
		const existingProduct = await this.productRepo.findById(id);
		if (!existingProduct) {
			throw new Error('Product not found');
		}

		// Business logic: Process update data
		const processedData = {
			...productData,
			updatedAt: new Date(),
		};

		return await this.productRepo.update(id, processedData);
	}

	async getAllProducts(page = 1, limit = 10) {
		// Business logic: Validate pagination
		const validPage = Math.max(1, parseInt(page));
		const validLimit = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page

		const result = await this.productRepo.findAll(
			{},
			{},
			validPage,
			validLimit
		);

		if (!result.data.length) {
			throw new Error('No products found');
		}

		return result;
	}

	async getProductById(productId) {
		// Business logic: Validate ID
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
		// Business logic: Validate category ID
		if (!categoryId) {
			throw new Error('Category ID is required');
		}

		// Business logic: Validate pagination
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
		// Business logic: Validate search input
		if (!input || input.trim() === '') {
			throw new Error('Search input is required');
		}

		// Business logic: Clean search input
		const cleanInput = input.trim();

		const products = await this.productRepo.searchProducts(cleanInput);

		if (!products.length) {
			throw new Error('No products found matching the search criteria');
		}

		return products;
	}

	async filterProducts(filter, page = 1, limit = 10) {
		// Business logic: Validate filter
		if (!filter || typeof filter !== 'object') {
			throw new Error('Filter criteria is required');
		}

		// Business logic: Process filter parameters
		const processedFilter = { ...filter };

		// Convert string boolean to actual boolean
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

		// Validate price range
		if (processedFilter.minPrice && processedFilter.maxPrice) {
			if (
				parseFloat(processedFilter.minPrice) >
				parseFloat(processedFilter.maxPrice)
			) {
				throw new Error('Minimum price cannot be greater than maximum price');
			}
		}

		// Business logic: Validate pagination
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
		// Business logic: Validate slug
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
		// Business logic: Validate slug
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
		// Business logic: Validate inputs
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
		// Business logic: Validate inputs
		if (!productId || !quantity) {
			throw new Error('Product ID and quantity are required');
		}

		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		return await this.productRepo.updateStock(productId, quantity);
	}

	// Variant-related methods (these might need a separate VariantService in a larger application)
	async createVariantForProduct(productId, variantData) {
		// Business logic: Validate inputs
		if (!productId || !variantData) {
			throw new Error('Product ID and variant data are required');
		}

		// Business logic: Check if product exists
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}

		// Business logic: Validate variant data
		if (!variantData.color || !variantData.storage || !variantData.price) {
			throw new Error('Variant must have color, storage, and price');
		}

		// Add variant through repository (this might need custom method)
		const updatedProduct = await this.productRepo.update(productId, {
			$push: { variants: { ...variantData, createdAt: new Date() } },
		});

		return updatedProduct;
	}

	async getListVariantForProduct(productId) {
		// Business logic: Validate ID
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
		// Business logic: Validate ID
		if (!variantId) {
			throw new Error('Variant ID is required');
		}

		// This would need a custom repository method or different approach
		// For now, implementing basic logic
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
		// Business logic: Validate inputs
		if (!productId || !variantData) {
			throw new Error('Product ID and variant data are required');
		}

		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}

		// Business logic for updating variant
		// This would need custom repository method for complex variant updates

		return await this.productRepo.update(productId, {
			variants: variantData,
			updatedAt: new Date(),
		});
	}

	async deleteVariantForProduct(variantId) {
		// Business logic: Validate ID
		if (!variantId) {
			throw new Error('Variant ID is required');
		}

		// This would need custom repository method for variant deletion
		// For now, basic implementation
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
		// Business logic: Validate ID
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
		// Business logic: Validate inputs
		if (!variantId || !quantity) {
			throw new Error('Variant ID and quantity are required');
		}

		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		// This would need custom repository method for variant stock management
		// For now, basic implementation
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

		// Update variant stock
		variant.stock -= quantity;
		variant.sold = (variant.sold || 0) + quantity;

		await this.productRepo.update(product._id, {
			variants: product.variants,
			updatedAt: new Date(),
		});

		return variant;
	}

	// Statistics
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

	// Pagination
	async getProductsPaginated(options) {
		const { page, limit, sort, order } = options;
		const skip = (page - 1) * limit;

		const sortObj = {};
		sortObj[sort] = order === 'desc' ? -1 : 1;

		const products = await this.productRepo.findAll(
			{},
			{
				skip,
				limit,
				sort: sortObj,
			}
		);

		const total = await this.productRepo.countDocuments({});

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

	// Category filtering
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

	// Featured products
	async getFeaturedProducts(limit = 10) {
		const products = await this.productRepo.findAll(
			{ isFeatured: true, status: 'active' },
			{ limit, sort: { createdAt: -1 } }
		);
		return products.data;
	}

	// Newest products
	async getNewestProducts(limit = 10) {
		const products = await this.productRepo.findAll(
			{ status: 'active' },
			{ limit, sort: { createdAt: -1 } }
		);
		return products.data;
	}

	// Popular products
	async getPopularProducts(limit = 10) {
		const products = await this.productRepo.findAll(
			{ status: 'active' },
			{ limit, sort: { sold: -1, views: -1 } }
		);
		return products.data;
	}

	// Get product by slug
	async getProductBySlug(slug) {
		const products = await this.productRepo.findAll({ slug });
		return products.data.length > 0 ? products.data[0] : null;
	}

	// Product reviews (placeholder - you might need a separate review model)
	async getProductReviews(productId, options = {}) {
		// This is a placeholder implementation
		// You would typically have a separate Review model/collection
		const { page = 1, limit = 10 } = options;

		// For now, return empty result
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
		// This is a placeholder implementation
		// You would typically have a separate Review model/collection
		// For now, just return the review data with an ID
		return {
			...reviewData,
			_id: new Date().getTime().toString(),
			createdAt: new Date(),
		};
	}

	// Product images
	async addProductImages(productId, images) {
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new Error('Product not found');
		}

		// Process images and add their paths to the product
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
