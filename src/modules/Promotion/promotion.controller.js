import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import joi from 'joi';
import PromotionService from './promotion.service.js';
import PromotionValidation from './promotion.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class PromotionController {
	constructor() {
		if (PromotionController.instance) return PromotionController.instance;
		PromotionController.instance = this;
	}

	createPromotion = catchAsync(async (req, res) => {
		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Promotion data is required',
				StatusCodes.BAD_REQUEST
			);
		}

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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const promotion = await PromotionService.createPromotion(value);

		if (!promotion) {
			return formatError(
				res,
				'Failed to create promotion',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Promotion created successfully',
			promotion,
			StatusCodes.CREATED
		);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const result = await PromotionService.getAllPromotions(value);

		if (!result || !result.promotions) {
			return formatFail(res, 'No promotions found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Promotions retrieved successfully',
			{
				promotions: result.promotions,
				pagination: result.pagination,
			},
			StatusCodes.OK
		);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const promotion = await PromotionService.getPromotionById(value.id);

		if (!promotion) {
			return formatFail(res, 'Promotion not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Promotion retrieved successfully',
			promotion,
			StatusCodes.OK
		);
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
			return formatFail(
				res,
				'Invalid promotion ID',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		if (bodyValidation.error) {
			const errorMessages = bodyValidation.error.details.map(
				(err) => err.message
			);
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const promotion = await PromotionService.updatePromotion(
			paramsValidation.value.id,
			bodyValidation.value
		);

		if (!promotion) {
			return formatFail(res, 'Promotion not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Promotion updated successfully',
			promotion,
			StatusCodes.OK
		);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const result = await PromotionService.deletePromotion(value.id);

		if (!result) {
			return formatFail(res, 'Promotion not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Promotion deleted successfully',
			null,
			StatusCodes.OK
		);
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
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const promotion = await PromotionService.togglePromotionStatus(value.id);

		if (!promotion) {
			return formatFail(res, 'Promotion not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			`Promotion ${
				promotion.isActive ? 'activated' : 'deactivated'
			} successfully`,
			promotion,
			StatusCodes.OK
		);
	});

	getActivePromotions = catchAsync(async (req, res) => {
		const promotions = await PromotionService.getActivePromotions();

		if (!promotions || promotions.length === 0) {
			return formatFail(
				res,
				'No active promotions found',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Active promotions retrieved successfully',
			promotions,
			StatusCodes.OK
		);
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
			return formatFail(
				res,
				'Invalid product ID',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const promotions = await PromotionService.getPromotionsByProduct(value.id);

		if (!promotions || promotions.length === 0) {
			return formatFail(
				res,
				'No promotions found for this product',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Product promotions retrieved successfully',
			promotions,
			StatusCodes.OK
		);
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
			return formatFail(
				res,
				'Invalid promotion ID',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		if (bodyValidation.error) {
			const errorMessages = bodyValidation.error.details.map(
				(err) => err.message
			);
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const promotion = await PromotionService.addProductsToPromotion(
			paramsValue.id,
			bodyValidation.value.productIds
		);

		if (!promotion) {
			return formatFail(res, 'Promotion not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Products added to promotion successfully',
			promotion,
			StatusCodes.OK
		);
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
			return formatFail(
				res,
				'Invalid promotion ID',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		if (bodyValidation.error) {
			const errorMessages = bodyValidation.error.details.map(
				(err) => err.message
			);
			return formatFail(
				res,
				'Validation failed',
				StatusCodes.BAD_REQUEST,
				errorMessages
			);
		}

		const promotion = await PromotionService.removeProductsFromPromotion(
			paramsValue.id,
			bodyValidation.value.productIds
		);

		if (!promotion) {
			return formatFail(res, 'Promotion not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Products removed from promotion successfully',
			promotion,
			StatusCodes.OK
		);
	});

	getExpiredPromotions = catchAsync(async (req, res) => {
		const promotions = await PromotionService.getExpiredPromotions();

		if (!promotions || promotions.length === 0) {
			return formatFail(
				res,
				'No expired promotions found',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Expired promotions retrieved successfully',
			promotions,
			StatusCodes.OK
		);
	});

	getUpcomingPromotions = catchAsync(async (req, res) => {
		const promotions = await PromotionService.getUpcomingPromotions();

		if (!promotions || promotions.length === 0) {
			return formatFail(
				res,
				'No upcoming promotions found',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Upcoming promotions retrieved successfully',
			promotions,
			StatusCodes.OK
		);
	});
}

export default new PromotionController();
