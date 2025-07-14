import { catchAsync } from '../../configs/catchAsync.js';
import { VariantValidation } from './variant.validation.js';
import VariantService from './variant.service.js';
import { StatusCodes } from 'http-status-codes';
import chalk from 'chalk';

class VariantController {
	constructor() {
		if (!VariantController.instance) return VariantController.instance;
		VariantController.instance = this;
	}
	createVariant = catchAsync(async (req, res) => {
		const { data } = req.body;
		const { error } = VariantValidation.createVariant.validate(data, {
			abortEarly: false,
			allowUnknown: true,
			convert: true,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: error.details.map((err) => err.message),
				success: false,
			});
		}
		const createdVariant = await VariantService.createVariantForProduct(data);
		if (!createdVariant) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to create product variant'),
				success: false,
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: chalk.green('Product variant created successfully'),
			success: true,
			data: createdVariant,
		});
	});
	getListVariantForProduct = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id || id === undefined) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Product ID is required'),
				success: false,
			});
		}
		const variants = await VariantService.getListVariantForProduct(id);
		if (!variants || variants.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('No variants found for this product'),
				success: false,
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Variants retrieved successfully'),
			success: true,
			data: variants,
		});
	});
}

export default new VariantController();
