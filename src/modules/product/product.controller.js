import { catchAsync } from '../../configs/catchAsync.js';
import chalk from 'chalk';
import { StatusCodes } from 'http-status-codes';
import ProductService from '../product.service.js';
import ValidationProduct from '../product.validation.js';

class ProductController {
	constructor() {
		if (ProductController.instance) return ProductController.instance;
		ProductController.instance = this;
	}
	createProduct = catchAsync(async (req, res) => {
		const {
			name,
			thumbnail,
			stock,
			sold,
			status,
			category_id,
			isNew,
			detail_id,
		} = req.body;
		if (
			!name ||
			!thumbnail ||
			!category_id ||
			!isNew ||
			!detail_id ||
			!stock ||
			!sold ||
			!status
		) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('All fields are required'),
				success: false,
			});
		}
		const productData = {
			name,
			thumbnail,
			stock,
			sold,
			status,
			category_id,
			isNew,
			detail_id,
		};
		const { error } = ValidationProduct.createProduct.validate(productData);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
				success: false,
			});
		}

		const newProduct = await ProductService.creatProduct(productData);

		if (!newProduct || newProduct === null) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Failed to create product'),
				success: false,
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: chalk.green('Product created successfully'),
			success: true,
			data: newProduct,
		});
	});
	deleteProduct = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id && id === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Product ID is required'),
				success: false,
			});
		}
		const deletedProduct = await ProductService.deleteProduct(id);
		if (!deletedProduct) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Product not found'),
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Product deleted successfully'),
			success: true,
			data: deletedProduct,
		});
	});
	getProductById = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id && id === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Product ID is required'),
				success: false,
			});
		}
		const product = await ProductService.getProductById(id);
		if (!product || product === null) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Product not found'),
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Product found successfully'),
			success: true,
			data: product,
		});
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
			isNew,
			detail_id,
		} = req.body;
		if (
			!name ||
			!thumbnail ||
			!category_id ||
			!isNew ||
			!detail_id ||
			!stock ||
			!sold ||
			!status ||
			!id
		) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('All fields are required'),
				success: false,
			});
		}
		const productData = {
			name,
			thumbnail,
			stock,
			sold,
			status,
			category_id,
			isNew,
			detail_id,
			id,
		};
		const _ValidationProduct = ValidationProduct.updateProduct;
		const { error } = _ValidationProduct.validate(productData);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
				success: false,
			});
		}
		const updatedProduct = await ProductService.updateProduct(id, productData);
		if (!updatedProduct || updatedProduct === null) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('Product not found'),
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Product updated successfully'),
			success: true,
			data: updatedProduct,
		});
	});
	getAllProducts = catchAsync(async (req, res) => {
		const products = await ProductService.getAllProducts();
		if (!products || products.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('No products found'),
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Products retrieved successfully'),
			success: true,
			data: products,
		});
	});
	getProductByCategory = catchAsync(async (req, res) => {
		const { category_id } = req.params;
		if (!category_id && category_id === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Category ID is required'),
				success: false,
			});
		}
		const products = await ProductService.getProductByCategory(category_id);
		if (!products || products.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('No products found for this category'),
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Products retrieved successfully'),
			success: true,
			data: products,
		});
	});
	searchProducts = catchAsync(async (req, res) => {
		const { input } = req.query;
		if (!input || input === '') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Search input is required'),
				success: false,
			});
		}
		const products = await ProductService.searchProducts(input);
	});
	filterProducts = catchAsync(async (req, res) => {
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
			page = 1,
			limit = 10,
		} = req.query;
		const filter = {
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
		};
		const _ValidationProduct = ValidationProduct.filterProducts;
		const { error } = _ValidationProduct.validate(filter);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
				success: false,
			});
		}
		const filteredProducts = await ProductService.filterProducts(
			filter,
			page,
			limit
		);
		if (!filteredProducts || filteredProducts.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('No products found matching the filter criteria'),
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Products filtered successfully'),
			success: true,
			data: filteredProducts,
		});
	});
	getProductsBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;
		if (!slug || slug === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Slug is required'),
				success: false,
			});
		}
		const products = await ProductService.getProductsBySlug(slug);
	});
}

export default ProductController;
