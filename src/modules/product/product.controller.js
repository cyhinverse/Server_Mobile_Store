import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import ProductService from './product.service.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class ProductController {
	constructor() {
		if (ProductController.instance) return ProductController.instance;
		ProductController.instance = this;
		this.productService = ProductService;
	}

	createProduct = catchAsync(async (req, res) => {
		// Validate request body
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail({
				res,
				message: 'Product data is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const newProduct = await this.productService.createProduct(req.body);
		return formatSuccess({
			res,
			message: 'Product created successfully',
			data: newProduct,
			statusCode: StatusCodes.CREATED,
		});
	});

	deleteProduct = catchAsync(async (req, res) => {
		const { id } = req.query;

		// Validate request parameters
		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		await this.productService.deleteProduct(id);
		return formatSuccess({
			res,
			message: 'Product deleted successfully',
			data: null,
			statusCode: StatusCodes.OK,
		});
	});

	getProductById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const product = await this.productService.getProductById(id);
		return formatSuccess({
			res,
			message: 'Product found successfully',
			data: product,
			statusCode: StatusCodes.OK,
		});
	});

	updateProduct = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		// Validate request body
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail({
				res,
				message: 'Product data is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedProduct = await this.productService.updateProduct(
			id,
			req.body
		);
		return formatSuccess({
			res,
			message: 'Product updated successfully',
			data: updatedProduct,
			statusCode: StatusCodes.OK,
		});
	});

	getAllProducts = catchAsync(async (req, res) => {
		// Extract and validate query parameters
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;

		const products = await this.productService.getAllProducts(page, limit);
		return formatSuccess({
			res,
			message: 'Products retrieved successfully',
			data: products,
			statusCode: StatusCodes.OK,
		});
	});

	getProductByCategory = catchAsync(async (req, res) => {
		const { category_id } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;

		// Validate request parameters
		if (!category_id) {
			return formatFail({
				res,
				message: 'Category ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const products = await this.productService.getProductByCategory(
			category_id,
			page,
			limit
		);
		return formatSuccess({
			res,
			message: 'Products retrieved successfully',
			data: products,
			statusCode: StatusCodes.OK,
		});
	});

	searchProducts = catchAsync(async (req, res) => {
		const { q, input } = req.query;
		const searchInput = q || input; // Support both 'q' and 'input' parameters

		// Validate request parameters
		if (!searchInput || searchInput === '') {
			return formatFail({
				res,
				message: 'Search input is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const products = await this.productService.searchProducts(searchInput);
			return formatSuccess({
				res,
				message: 'Products found successfully',
				data: products,
				statusCode: StatusCodes.OK,
			});
		} catch (error) {
			// If no products found, return empty array instead of error
			if (error.message === 'No products found matching the search criteria') {
				return formatSuccess({
					res,
					message: 'No products found',
					data: [],
					statusCode: StatusCodes.OK,
				});
			}
			// Re-throw other errors
			throw error;
		}
	});

	filterProducts = catchAsync(async (req, res) => {
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
			page = 1,
			limit = 10,
		} = req.query;

		const filter = {
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
		};

		// Validate filter parameters using Joi
		const { error } = ValidationProduct.filterProducts.validate(filter);

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const filteredProducts = await this.productService.filterProducts(
			filter,
			page,
			limit
		);
		return formatSuccess({
			res,
			message: 'Products filtered successfully',
			data: filteredProducts,
			statusCode: StatusCodes.OK,
		});
	});

	getProductsBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;

		// Validate request parameters
		if (!slug) {
			return formatFail({
				res,
				message: 'Slug is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const products = await this.productService.getProductsBySlug(slug);
		return formatSuccess({
			res,
			message: 'Products retrieved successfully',
			data: products,
			statusCode: StatusCodes.OK,
		});
	});

	getProductDetails = catchAsync(async (req, res) => {
		const { slug } = req.params;

		// Validate request parameters
		if (!slug) {
			return formatFail({
				res,
				message: 'Slug is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const productDetails = await this.productService.getProductDetails(slug);
		return formatSuccess({
			res,
			message: 'Product details retrieved successfully',
			data: productDetails,
			statusCode: StatusCodes.OK,
		});
	});

	updateDetailForPorduct = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { data } = req.body;

		// Validate request parameters
		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		if (!data) {
			return formatFail({
				res,
				message: 'Product data is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedProduct = await this.productService.updateProduct(id, data);
		return formatSuccess({
			res,
			message: 'Product details updated successfully',
			data: updatedProduct,
			statusCode: StatusCodes.OK,
		});
	});

	getListVariantForProduct = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const variants = await this.productService.getListVariantForProduct(id);
		return formatSuccess({
			res,
			message: 'Variants retrieved successfully',
			data: variants,
			statusCode: StatusCodes.OK,
		});
	});

	getVariantById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail({
				res,
				message: 'Variant ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const variant = await this.productService.getVariantById(id);
		return formatSuccess({
			res,
			message: 'Variant retrieved successfully',
			data: variant,
			statusCode: StatusCodes.OK,
		});
	});

	checkStock = catchAsync(async (req, res) => {
		const { productId, quantity } = req.body;

		// Validate request body
		if (!productId || !quantity) {
			return formatFail({
				res,
				message: 'Product ID and quantity are required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const isAvailable = await this.productService.checkStock(
			productId,
			quantity
		);
		return formatSuccess({
			res,
			message: 'Stock is available',
			data: { available: isAvailable },
			statusCode: StatusCodes.OK,
		});
	});

	createVariantForProductId = catchAsync(async (req, res) => {
		const { productId } = req.params;
		const { variantData } = req.body;

		// Validate request parameters
		if (!productId) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		if (!variantData) {
			return formatFail({
				res,
				message: 'Variant data is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const newVariant = await this.productService.createVariantForProduct(
			productId,
			variantData
		);
		return formatSuccess({
			res,
			message: 'Variant created successfully',
			data: newVariant,
			statusCode: StatusCodes.CREATED,
		});
	});

	updateVariantForProduct = catchAsync(async (req, res) => {
		const { productId } = req.params;
		const { data } = req.body;

		// Validate request parameters
		if (!productId) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		if (!data) {
			return formatFail({
				res,
				message: 'Variant data is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedVariant = await this.productService.updateVariantForProduct(
			productId,
			data
		);
		return formatSuccess({
			res,
			message: 'Variant updated successfully',
			data: updatedVariant,
			statusCode: StatusCodes.OK,
		});
	});

	deleteVariantForProduct = catchAsync(async (req, res) => {
		const { variantId } = req.params;

		// Validate request parameters
		if (!variantId) {
			return formatFail({
				res,
				message: 'Variant ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const deletedVariant = await this.productService.deleteVariantForProduct(
			variantId
		);
		return formatSuccess({
			res,
			message: 'Variant deleted successfully',
			data: deletedVariant,
			statusCode: StatusCodes.OK,
		});
	});

	getVariantByProductId = catchAsync(async (req, res) => {
		const { productId } = req.params;

		// Validate request parameters
		if (!productId) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const variant = await this.productService.getVariantByProductId(productId);
		return formatSuccess({
			res,
			message: 'Variant retrieved successfully',
			data: variant,
			statusCode: StatusCodes.OK,
		});
	});

	checkAndUpdateStock = catchAsync(async (req, res) => {
		const { variantId, quantity } = req.body;

		// Validate request body
		if (!variantId || !quantity) {
			return formatFail({
				res,
				message: 'Variant ID and quantity are required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedVariant = await this.productService.checkAndUpdateStock(
			variantId,
			quantity
		);
		return formatSuccess({
			res,
			message: 'Stock updated successfully',
			data: updatedVariant,
			statusCode: StatusCodes.OK,
		});
	});

	// Statistics
	getProductStats = catchAsync(async (req, res) => {
		const stats = await this.productService.getProductStats();
		return formatSuccess({
			res,
			message: 'Product statistics retrieved successfully',
			code: StatusCodes.OK,
			data: stats,
		});
	});

	// Pagination
	getProductsPaginated = catchAsync(async (req, res) => {
		const {
			page = 1,
			limit = 10,
			sort = 'createdAt',
			order = 'desc',
		} = req.query;
		const products = await this.productService.getProductsPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
			sort,
			order,
		});
		return formatSuccess({
			res,
			message: 'Products retrieved successfully',
			data: products,
			statusCode: StatusCodes.OK,
		});
	});

	// Category filtering
	getProductsByCategory = catchAsync(async (req, res) => {
		const { categoryId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!categoryId) {
			return formatFail({
				res,
				message: 'Category ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const products = await this.productService.getProductsByCategory(
			categoryId,
			{ page: parseInt(page), limit: parseInt(limit) }
		);
		return formatSuccess({
			res,
			message: 'Products by category retrieved successfully',
			code: StatusCodes.OK,
			data: products,
		});
	});

	// Featured products
	getFeaturedProducts = catchAsync(async (req, res) => {
		const { limit = 10 } = req.query;
		const products = await this.productService.getFeaturedProducts(
			parseInt(limit)
		);
		return formatSuccess({
			res,
			message: 'Featured products retrieved successfully',
			code: StatusCodes.OK,
			data: products,
		});
	});

	// Newest products
	getNewestProducts = catchAsync(async (req, res) => {
		const { limit = 10 } = req.query;
		const products = await this.productService.getNewestProducts(
			parseInt(limit)
		);
		return formatSuccess({
			res,
			message: 'Newest products retrieved successfully',
			code: StatusCodes.OK,
			data: products,
		});
	});

	// Popular products
	getPopularProducts = catchAsync(async (req, res) => {
		const { limit = 10 } = req.query;
		const products = await this.productService.getPopularProducts(
			parseInt(limit)
		);
		return formatSuccess({
			res,
			message: 'Popular products retrieved successfully',
			code: StatusCodes.OK,
			data: products,
		});
	});

	// Get product by slug
	getProductBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;

		if (!slug) {
			return formatFail({
				res,
				message: 'Product slug is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const product = await this.productService.getProductBySlug(slug);
		if (!product) {
			return formatFail({
				res,
				message: 'Product not found',
				statusCode: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			message: 'Product retrieved successfully',
			code: StatusCodes.OK,
			data: product,
		});
	});

	// Product reviews
	getProductReviews = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const reviews = await this.productService.getProductReviews(id, {
			page: parseInt(page),
			limit: parseInt(limit),
		});
		return formatSuccess({
			res,
			message: 'Product reviews retrieved successfully',
			code: StatusCodes.OK,
			data: reviews,
		});
	});

	addProductReview = catchAsync(async (req, res) => {
		const { id } = req.params;
		const userId = req.user.id;
		const reviewData = { ...req.body, userId, productId: id };

		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const review = await this.productService.addProductReview(reviewData);
		return formatSuccess({
			res,
			message: 'Review added successfully',
			code: StatusCodes.CREATED,
			data: review,
		});
	});

	// Product images
	addProductImages = catchAsync(async (req, res) => {
		const { id } = req.params;
		const images = req.files;

		if (!id) {
			return formatFail({
				res,
				message: 'Product ID is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		if (!images || images.length === 0) {
			return formatFail({
				res,
				message: 'At least one image is required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		const result = await this.productService.addProductImages(id, images);
		return formatSuccess({
			res,
			message: 'Images added successfully',
			code: StatusCodes.OK,
			data: result,
		});
	});

	deleteProductImage = catchAsync(async (req, res) => {
		const { id, imageId } = req.params;

		if (!id || !imageId) {
			return formatFail({
				res,
				message: 'Product ID and Image ID are required',
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}

		await this.productService.deleteProductImage(id, imageId);
		return formatSuccess({
			res,
			message: 'Image deleted successfully',
			code: StatusCodes.OK,
		});
	});
}

export default new ProductController();
