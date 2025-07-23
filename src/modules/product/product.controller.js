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
	}
	createProduct = catchAsync(async (req, res) => {
		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Product data is required',
				StatusCodes.BAD_REQUEST
			);
		}

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

		const newProduct = await ProductService.createProduct(value);

		if (!newProduct) {
			return formatError(
				res,
				'Failed to create product',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Product created successfully',
			newProduct,
			StatusCodes.CREATED
		);
	});
	deleteProduct = catchAsync(async (req, res) => {
		const { id } = req.query;

		// Validate input
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		console.log(`checking id: ${id}`);
		const deletedProduct = await ProductService.deleteProduct(id);

		if (!deletedProduct) {
			return formatFail(res, 'Product not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Product deleted successfully',
			null,
			StatusCodes.OK
		);
	});
	getProductById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		const product = await ProductService.getProductById(id);

		if (!product) {
			return formatFail(res, 'Product not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Product found successfully',
			product,
			StatusCodes.OK
		);
	});
	updateProduct = catchAsync(async (req, res) => {
		const { id } = req.params;
		const {
			name,
			thumbnail,
			stock,
			sold,
			status,
			category_id,
			isNewProduct,
			detail_id,
		} = req.body;

		// Validate required fields
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		if (
			!name ||
			!thumbnail ||
			!category_id ||
			!isNewProduct ||
			!detail_id ||
			!stock ||
			!sold ||
			!status
		) {
			return formatFail(
				res,
				'All fields are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const productData = {
			name,
			thumbnail,
			stock,
			sold,
			status,
			category_id,
			isNewProduct,
			detail_id,
			id,
		};

		const _ValidationProduct = ValidationProduct.updateProduct;
		const { error } = _ValidationProduct.validate(productData);

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const updatedProduct = await ProductService.updateProduct(id, productData);

		if (!updatedProduct) {
			return formatFail(res, 'Product not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Product updated successfully',
			updatedProduct,
			StatusCodes.OK
		);
	});
	getAllProducts = catchAsync(async (req, res) => {
		const products = await ProductService.getAllProducts();

		if (!products || products.length === 0) {
			return formatFail(res, 'No products found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Products retrieved successfully',
			products,
			StatusCodes.OK
		);
	});
	getProductByCategory = catchAsync(async (req, res) => {
		const { category_id } = req.params;

		// Validate input
		if (!category_id) {
			return formatFail(
				res,
				'Category ID is required',
				StatusCodes.BAD_REQUEST
			);
		}

		const products = await ProductService.getProductByCategory(category_id);

		if (!products || products.length === 0) {
			return formatFail(
				res,
				'No products found for this category',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Products retrieved successfully',
			products,
			StatusCodes.OK
		);
	});
	searchProducts = catchAsync(async (req, res) => {
		const { input } = req.query;

		// Validate input
		if (!input || input === '') {
			return formatFail(
				res,
				'Search input is required',
				StatusCodes.BAD_REQUEST
			);
		}

		const products = await ProductService.searchProducts(input);

		if (!products || products.length === 0) {
			return formatFail(
				res,
				'No products found matching the search criteria',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Products found successfully',
			products,
			StatusCodes.OK
		);
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

		const _ValidationProduct = ValidationProduct.filterProducts;
		const { error } = _ValidationProduct.validate(filter);

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const filteredProducts = await ProductService.filterProducts(
			filter,
			page,
			limit
		);

		if (!filteredProducts || filteredProducts.length === 0) {
			return formatFail(
				res,
				'No products found matching the filter criteria',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Products filtered successfully',
			filteredProducts,
			StatusCodes.OK
		);
	});
	getProductsBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;

		// Validate input
		if (!slug) {
			return formatFail(res, 'Slug is required', StatusCodes.BAD_REQUEST);
		}

		const products = await ProductService.getProductsBySlug(slug);

		if (!products || products.length === 0) {
			return formatFail(
				res,
				'No products found for this slug',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Products retrieved successfully',
			products,
			StatusCodes.OK
		);
	});
	getProductDetails = catchAsync(async (req, res) => {
		const { slug } = req.params;

		// Validate input
		if (!slug) {
			return formatFail(res, 'Slug is required', StatusCodes.BAD_REQUEST);
		}

		const productDetails = await ProductService.getProductDetails(slug);

		if (!productDetails) {
			return formatFail(
				res,
				'Product details not found',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Product details retrieved successfully',
			productDetails,
			StatusCodes.OK
		);
	});
	updateDetailForPorduct = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { data } = req.body;

		// Validate input
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

		const updatedProduct = await ProductService.updateProduct(id, data);

		if (!updatedProduct) {
			return formatFail(res, 'Product not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Product details updated successfully',
			updatedProduct,
			StatusCodes.OK
		);
	});
	getListVariantForProduct = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input
		if (!id) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		const variants = await ProductService.getListVariantForProduct(id);

		if (!variants || variants.length === 0) {
			return formatFail(
				res,
				'No variants found for this product',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Variants retrieved successfully',
			variants,
			StatusCodes.OK
		);
	});
	getVariantById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input
		if (!id) {
			return formatFail(res, 'Variant ID is required', StatusCodes.BAD_REQUEST);
		}

		const variant = await ProductService.getVariantById(id);

		if (!variant) {
			return formatFail(res, 'Variant not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Variant retrieved successfully',
			variant,
			StatusCodes.OK
		);
	});
	checkStock = catchAsync(async (req, res) => {
		const { productId, quantity } = req.body;

		// Validate input
		if (!productId || !quantity) {
			return formatFail(
				res,
				'Product ID and quantity are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const isAvailable = await ProductService.checkStock(productId, quantity);

		if (!isAvailable) {
			return formatFail(
				res,
				'Insufficient stock for the requested product',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Stock is available',
			isAvailable,
			StatusCodes.OK
		);
	});
	createVariantForProductId = catchAsync(async (req, res) => {
		const { productId } = req.params;
		const { variantData } = req.body;

		// Validate input
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

		const newVariant = await ProductService.createVariantForProduct(
			productId,
			variantData
		);

		if (!newVariant) {
			return formatError(
				res,
				'Failed to create variant for product',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Variant created successfully',
			newVariant,
			StatusCodes.CREATED
		);
	});
	updateVariantForProduct = catchAsync(async (req, res) => {
		const { productId } = req.params;
		const { data } = req.body;

		// Validate input
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

		const updatedVariant = await ProductService.updateVariantForProduct(
			productId,
			data
		);

		if (!updatedVariant) {
			return formatFail(
				res,
				'Variant not found or update failed',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Variant updated successfully',
			updatedVariant,
			StatusCodes.OK
		);
	});
	deleteVariantForProduct = catchAsync(async (req, res) => {
		const { variantId } = req.params;

		// Validate input
		if (!variantId) {
			return formatFail(res, 'Variant ID is required', StatusCodes.BAD_REQUEST);
		}

		const deletedVariant = await ProductService.deleteVariantForProduct(
			variantId
		);

		if (!deletedVariant) {
			return formatFail(
				res,
				'Variant not found or delete failed',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Variant deleted successfully',
			deletedVariant,
			StatusCodes.OK
		);
	});
	getVariantByProductId = catchAsync(async (req, res) => {
		const { productId } = req.params;

		// Validate input
		if (!productId) {
			return formatFail(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
		}

		const variant = await ProductService.getVariantByProductId(productId);

		if (!variant) {
			return formatFail(
				res,
				'Variant not found for this product',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Variant retrieved successfully',
			variant,
			StatusCodes.OK
		);
	});
	checkAndUpdateStock = catchAsync(async (req, res) => {
		const { variantId, quantity } = req.body;

		// Validate input
		if (!variantId || !quantity) {
			return formatFail(
				res,
				'Variant ID and quantity are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const updatedVariant = await ProductService.checkAndUpdateStock(
			variantId,
			quantity
		);

		return formatSuccess(
			res,
			'Stock updated successfully',
			updatedVariant,
			StatusCodes.OK
		);
	});
}

export default new ProductController();
