import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import ProductService from './product.service.js';
import ValidationProduct from './product.validation.js';
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
			return formatFail(
				res,
				'Product data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		// Validate input data using Joi
		const { error, value } = ValidationProduct.createProduct.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const newProduct = await this.productService.createProduct(value);
			return formatSuccess(
				res,
				'Product created successfully',
				newProduct,
				StatusCodes.CREATED
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	deleteProduct = catchAsync(async (req, res) => {
		const { id } = req.query;

		// Validate request parameters
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			await this.productService.deleteProduct(id);
			return formatSuccess(
				res,
				'Product deleted successfully',
				null,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'Product not found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getProductById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const product = await this.productService.getProductById(id);
			return formatSuccess(
				res,
				'Product found successfully',
				product,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'Product not found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	updateProduct = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		// Validate request body
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Product data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		// Validate input data using Joi
		const { error, value } = ValidationProduct.updateProduct.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		try {
			const updatedProduct = await this.productService.updateProduct(id, value);
			return formatSuccess(
				res,
				'Product updated successfully',
				updatedProduct,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'Product not found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getAllProducts = catchAsync(async (req, res) => {
		// Extract and validate query parameters
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;

		try {
			const products = await this.productService.getAllProducts(page, limit);
			return formatSuccess(
				res,
				'Products retrieved successfully',
				products,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'No products found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getProductByCategory = catchAsync(async (req, res) => {
		const { category_id } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;

		// Validate request parameters
		if (!category_id) {
			return formatFail(
				res,
				'Category ID is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const products = await this.productService.getProductByCategory(
				category_id,
				page,
				limit
			);
			return formatSuccess(
				res,
				'Products retrieved successfully',
				products,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'No products found for this category') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	searchProducts = catchAsync(async (req, res) => {
		const { input } = req.query;

		// Validate request parameters
		if (!input || input === '') {
			return formatFail(
				res,
				'Search input is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const products = await this.productService.searchProducts(input);
			return formatSuccess(
				res,
				'Products found successfully',
				products,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'No products found matching the search criteria') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		try {
			const filteredProducts = await this.productService.filterProducts(
				filter,
				page,
				limit
			);
			return formatSuccess(
				res,
				'Products filtered successfully',
				filteredProducts,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message.includes('No products found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getProductsBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;

		// Validate request parameters
		if (!slug) {
			return formatFail(res, 'Slug is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const products = await this.productService.getProductsBySlug(slug);
			return formatSuccess(
				res,
				'Products retrieved successfully',
				products,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'No products found for this slug') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getProductDetails = catchAsync(async (req, res) => {
		const { slug } = req.params;

		// Validate request parameters
		if (!slug) {
			return formatFail(res, 'Slug is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const productDetails = await this.productService.getProductDetails(slug);
			return formatSuccess(
				res,
				'Product details retrieved successfully',
				productDetails,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'Product details not found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	updateDetailForPorduct = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { data } = req.body;

		// Validate request parameters
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		if (!data) {
			return formatFail(
				res,
				'Product data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const updatedProduct = await this.productService.updateProduct(id, data);
			return formatSuccess(
				res,
				'Product details updated successfully',
				updatedProduct,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'Product not found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getListVariantForProduct = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const variants = await this.productService.getListVariantForProduct(id);
			return formatSuccess(
				res,
				'Variants retrieved successfully',
				variants,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getVariantById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate request parameters
		if (!id) {
			return formatFail(res, 'Variant ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const variant = await this.productService.getVariantById(id);
			return formatSuccess(
				res,
				'Variant retrieved successfully',
				variant,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message === 'Variant not found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	checkStock = catchAsync(async (req, res) => {
		const { productId, quantity } = req.body;

		// Validate request body
		if (!productId || !quantity) {
			return formatFail(
				res,
				'Product ID and quantity are required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const isAvailable = await this.productService.checkStock(
				productId,
				quantity
			);
			return formatSuccess(
				res,
				'Stock is available',
				{ available: isAvailable },
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message.includes('Insufficient stock')) {
				return formatFail(res, error.message, StatusCodes.BAD_REQUEST);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	createVariantForProductId = catchAsync(async (req, res) => {
		const { productId } = req.params;
		const { variantData } = req.body;

		// Validate request parameters
		if (!productId) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		if (!variantData) {
			return formatFail(
				res,
				'Variant data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const newVariant = await this.productService.createVariantForProduct(
				productId,
				variantData
			);
			return formatSuccess(
				res,
				'Variant created successfully',
				newVariant,
				StatusCodes.CREATED
			);
		} catch (error) {
			if (error.message === 'Product not found') {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	updateVariantForProduct = catchAsync(async (req, res) => {
		const { productId } = req.params;
		const { data } = req.body;

		// Validate request parameters
		if (!productId) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		if (!data) {
			return formatFail(
				res,
				'Variant data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const updatedVariant = await this.productService.updateVariantForProduct(
				productId,
				data
			);
			return formatSuccess(
				res,
				'Variant updated successfully',
				updatedVariant,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	deleteVariantForProduct = catchAsync(async (req, res) => {
		const { variantId } = req.params;

		// Validate request parameters
		if (!variantId) {
			return formatFail(res, 'Variant ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const deletedVariant = await this.productService.deleteVariantForProduct(
				variantId
			);
			return formatSuccess(
				res,
				'Variant deleted successfully',
				deletedVariant,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	getVariantByProductId = catchAsync(async (req, res) => {
		const { productId } = req.params;

		// Validate request parameters
		if (!productId) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const variant = await this.productService.getVariantByProductId(
				productId
			);
			return formatSuccess(
				res,
				'Variant retrieved successfully',
				variant,
				StatusCodes.OK
			);
		} catch (error) {
			if (error.message.includes('not found')) {
				return formatFail(res, error.message, StatusCodes.NOT_FOUND);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	checkAndUpdateStock = catchAsync(async (req, res) => {
		const { variantId, quantity } = req.body;

		// Validate request body
		if (!variantId || !quantity) {
			return formatFail(
				res,
				'Variant ID and quantity are required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const updatedVariant = await this.productService.checkAndUpdateStock(
				variantId,
				quantity
			);
			return formatSuccess(
				res,
				'Stock updated successfully',
				updatedVariant,
				StatusCodes.OK
			);
		} catch (error) {
			if (
				error.message.includes('not found') ||
				error.message.includes('Insufficient')
			) {
				return formatFail(res, error.message, StatusCodes.BAD_REQUEST);
			}
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Statistics
	getProductStats = catchAsync(async (req, res) => {
		try {
			const stats = await this.productService.getProductStats();
			return formatSuccess(
				res,
				'Product statistics retrieved successfully',
				StatusCodes.OK,
				stats
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Pagination
	getProductsPaginated = catchAsync(async (req, res) => {
		try {
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
			return formatSuccess(
				res,
				'Products retrieved successfully',
				StatusCodes.OK,
				products
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Category filtering
	getProductsByCategory = catchAsync(async (req, res) => {
		const { categoryId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!categoryId) {
			return formatFail(
				res,
				'Category ID is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const products = await this.productService.getProductsByCategory(
				categoryId,
				{ page: parseInt(page), limit: parseInt(limit) }
			);
			return formatSuccess(
				res,
				'Products by category retrieved successfully',
				StatusCodes.OK,
				products
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Featured products
	getFeaturedProducts = catchAsync(async (req, res) => {
		try {
			const { limit = 10 } = req.query;
			const products = await this.productService.getFeaturedProducts(
				parseInt(limit)
			);
			return formatSuccess(
				res,
				'Featured products retrieved successfully',
				StatusCodes.OK,
				products
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Newest products
	getNewestProducts = catchAsync(async (req, res) => {
		try {
			const { limit = 10 } = req.query;
			const products = await this.productService.getNewestProducts(
				parseInt(limit)
			);
			return formatSuccess(
				res,
				'Newest products retrieved successfully',
				StatusCodes.OK,
				products
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Popular products
	getPopularProducts = catchAsync(async (req, res) => {
		try {
			const { limit = 10 } = req.query;
			const products = await this.productService.getPopularProducts(
				parseInt(limit)
			);
			return formatSuccess(
				res,
				'Popular products retrieved successfully',
				StatusCodes.OK,
				products
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Get product by slug
	getProductBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;

		if (!slug) {
			return formatFail(
				res,
				'Product slug is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const product = await this.productService.getProductBySlug(slug);
			if (!product) {
				return formatFail(res, 'Product not found', StatusCodes.NOT_FOUND);
			}
			return formatSuccess(
				res,
				'Product retrieved successfully',
				StatusCodes.OK,
				product
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Product reviews
	getProductReviews = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const reviews = await this.productService.getProductReviews(id, {
				page: parseInt(page),
				limit: parseInt(limit),
			});
			return formatSuccess(
				res,
				'Product reviews retrieved successfully',
				StatusCodes.OK,
				reviews
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	addProductReview = catchAsync(async (req, res) => {
		const { id } = req.params;
		const userId = req.user.id;
		const reviewData = { ...req.body, userId, productId: id };

		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		try {
			const review = await this.productService.addProductReview(reviewData);
			return formatSuccess(
				res,
				'Review added successfully',
				StatusCodes.CREATED,
				review
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	// Product images
	addProductImages = catchAsync(async (req, res) => {
		const { id } = req.params;
		const images = req.files;

		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		if (!images || images.length === 0) {
			return formatFail(
				res,
				'At least one image is required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			const result = await this.productService.addProductImages(id, images);
			return formatSuccess(
				res,
				'Images added successfully',
				StatusCodes.OK,
				result
			);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});

	deleteProductImage = catchAsync(async (req, res) => {
		const { id, imageId } = req.params;

		if (!id || !imageId) {
			return formatFail(
				res,
				'Product ID and Image ID are required',
				StatusCodes.BAD_REQUEST
			);
		}

		try {
			await this.productService.deleteProductImage(id, imageId);
			return formatSuccess(res, 'Image deleted successfully', StatusCodes.OK);
		} catch (error) {
			return formatError(res, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	});
}

export default new ProductController();
