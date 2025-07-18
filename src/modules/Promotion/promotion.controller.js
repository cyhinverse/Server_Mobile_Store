import { catchAsync } from '../../configs/catchAsync.js';
import chalk from 'chalk';
import { StatusCodes } from 'http-status-codes';
import joi from 'joi';
import PromotionService from './promotion.service.js';
import PromotionValidation from './promotion.validation.js';

class PromotionController {
	constructor() {
		if (PromotionController.instance) return PromotionController.instance;
		PromotionController.instance = this;
	}

	createPromotion = catchAsync(async (req, res) => {
		const { error, value } = PromotionValidation.createPromotion.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const promotion = await PromotionService.createPromotion(value);

			return res.status(StatusCodes.CREATED).json({
				message: chalk.green('Promotion created successfully'),
				data: promotion,
				success: true,
			});
		} catch (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	getAllPromotions = catchAsync(async (req, res) => {
		const { error, value } = PromotionValidation.queryPromotion.validate(
			req.query,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const result = await PromotionService.getAllPromotions(value);

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Promotions retrieved successfully'),
				data: result.promotions,
				pagination: result.pagination,
				success: true,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	getPromotionById = catchAsync(async (req, res) => {
		const { error, value } = PromotionValidation.promotionId.validate(
			req.params,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const promotion = await PromotionService.getPromotionById(value.id);

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Promotion retrieved successfully'),
				data: promotion,
				success: true,
			});
		} catch (error) {
			const statusCode =
				error.message === 'Promotion not found'
					? StatusCodes.NOT_FOUND
					: StatusCodes.INTERNAL_SERVER_ERROR;

			return res.status(statusCode).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	updatePromotion = catchAsync(async (req, res) => {
		const paramsValidation = PromotionValidation.promotionId.validate(
			req.params
		);
		const bodyValidation = PromotionValidation.updatePromotion.validate(
			req.body,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (paramsValidation.error) {
			const errorMessages = paramsValidation.error.details.map(
				(err) => err.message
			);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Invalid promotion ID'),
				errors: errorMessages,
				success: false,
			});
		}

		if (bodyValidation.error) {
			const errorMessages = bodyValidation.error.details.map(
				(err) => err.message
			);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const promotion = await PromotionService.updatePromotion(
				paramsValidation.value.id,
				bodyValidation.value
			);

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Promotion updated successfully'),
				data: promotion,
				success: true,
			});
		} catch (error) {
			const statusCode =
				error.message === 'Promotion not found'
					? StatusCodes.NOT_FOUND
					: StatusCodes.BAD_REQUEST;

			return res.status(statusCode).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	deletePromotion = catchAsync(async (req, res) => {
		const { error, value } = PromotionValidation.promotionId.validate(
			req.params,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			await PromotionService.deletePromotion(value.id);

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Promotion deleted successfully'),
				success: true,
			});
		} catch (error) {
			const statusCode =
				error.message === 'Promotion not found'
					? StatusCodes.NOT_FOUND
					: StatusCodes.INTERNAL_SERVER_ERROR;

			return res.status(statusCode).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	togglePromotionStatus = catchAsync(async (req, res) => {
		const { error, value } = PromotionValidation.promotionId.validate(
			req.params,
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const promotion = await PromotionService.togglePromotionStatus(value.id);

			return res.status(StatusCodes.OK).json({
				message: chalk.green(
					`Promotion ${
						promotion.isActive ? 'activated' : 'deactivated'
					} successfully`
				),
				data: promotion,
				success: true,
			});
		} catch (error) {
			const statusCode =
				error.message === 'Promotion not found'
					? StatusCodes.NOT_FOUND
					: StatusCodes.INTERNAL_SERVER_ERROR;

			return res.status(statusCode).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	getActivePromotions = catchAsync(async (req, res) => {
		try {
			const promotions = await PromotionService.getActivePromotions();

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Active promotions retrieved successfully'),
				data: promotions,
				success: true,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	getPromotionsByProduct = catchAsync(async (req, res) => {
		const { error, value } = PromotionValidation.promotionId.validate(
			{ id: req.params.productId },
			{
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
			}
		);

		if (error) {
			const errorMessages = error.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Invalid product ID'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const promotions = await PromotionService.getPromotionsByProduct(
				value.id
			);

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Product promotions retrieved successfully'),
				data: promotions,
				success: true,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	addProductsToPromotion = catchAsync(async (req, res) => {
		const { error: paramsError, value: paramsValue } =
			PromotionValidation.promotionId.validate(req.params);

		const bodyValidation = joi
			.object({
				productIds: joi
					.array()
					.items(
						joi
							.string()
							.pattern(/^[0-9a-fA-F]{24}$/)
							.message('Invalid product ID format')
					)
					.min(1)
					.required()
					.messages({
						'array.base': 'Product IDs must be an array',
						'array.min': 'At least one product ID is required',
						'any.required': 'Product IDs are required',
					}),
			})
			.validate(req.body);

		if (paramsError) {
			const errorMessages = paramsError.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Invalid promotion ID'),
				errors: errorMessages,
				success: false,
			});
		}

		if (bodyValidation.error) {
			const errorMessages = bodyValidation.error.details.map(
				(err) => err.message
			);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const promotion = await PromotionService.addProductsToPromotion(
				paramsValue.id,
				bodyValidation.value.productIds
			);

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Products added to promotion successfully'),
				data: promotion,
				success: true,
			});
		} catch (error) {
			const statusCode =
				error.message === 'Promotion not found'
					? StatusCodes.NOT_FOUND
					: StatusCodes.BAD_REQUEST;

			return res.status(statusCode).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	removeProductsFromPromotion = catchAsync(async (req, res) => {
		const { error: paramsError, value: paramsValue } =
			PromotionValidation.promotionId.validate(req.params);

		const bodyValidation = joi
			.object({
				productIds: joi
					.array()
					.items(
						joi
							.string()
							.pattern(/^[0-9a-fA-F]{24}$/)
							.message('Invalid product ID format')
					)
					.min(1)
					.required()
					.messages({
						'array.base': 'Product IDs must be an array',
						'array.min': 'At least one product ID is required',
						'any.required': 'Product IDs are required',
					}),
			})
			.validate(req.body);

		if (paramsError) {
			const errorMessages = paramsError.details.map((err) => err.message);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Invalid promotion ID'),
				errors: errorMessages,
				success: false,
			});
		}

		if (bodyValidation.error) {
			const errorMessages = bodyValidation.error.details.map(
				(err) => err.message
			);
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Validation failed'),
				errors: errorMessages,
				success: false,
			});
		}

		try {
			const promotion = await PromotionService.removeProductsFromPromotion(
				paramsValue.id,
				bodyValidation.value.productIds
			);

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Products removed from promotion successfully'),
				data: promotion,
				success: true,
			});
		} catch (error) {
			const statusCode =
				error.message === 'Promotion not found'
					? StatusCodes.NOT_FOUND
					: StatusCodes.BAD_REQUEST;

			return res.status(statusCode).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	getExpiredPromotions = catchAsync(async (req, res) => {
		try {
			const promotions = await PromotionService.getExpiredPromotions();

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Expired promotions retrieved successfully'),
				data: promotions,
				success: true,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});

	getUpcomingPromotions = catchAsync(async (req, res) => {
		try {
			const promotions = await PromotionService.getUpcomingPromotions();

			return res.status(StatusCodes.OK).json({
				message: chalk.green('Upcoming promotions retrieved successfully'),
				data: promotions,
				success: true,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red(error.message),
				success: false,
			});
		}
	});
}

export default new PromotionController();
