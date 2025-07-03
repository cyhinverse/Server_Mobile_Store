import { catchAsync } from '../configs/catchAsync';
import chalk from 'chalk';
import { StatusCodes } from 'http-status-codes';
import ProductService from '../services/product.service.js';
import ValidationProduct from '../validations/product.validation.js';

class ProductController {
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
}

export default ProductController;
