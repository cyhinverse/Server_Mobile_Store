import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
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

	/**
	 * Create new promotion
	 * POST /api/promotions
	 */
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
			return formatFail({
				res,
				message: 'Validation failed',
				statusCode: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				code: 400,
			});
		}

		try {
			const promotion = await PromotionService.createPromotion(value);

			return formatSuccess({
				res,
				message: 'Promotion created successfully',
				data: promotion,
				statusCode: StatusCodes.CREATED,
				code: 201,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to create promotion',
				statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get all promotions with filtering and pagination
	 * GET /api/promotions
	 */
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
			return formatFail({
				res,
				message: 'Validation failed',
				statusCode: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
				code: 400,
			});
		}

		try {
			const result = await PromotionService.getAllPromotions(value);

			return formatSuccess({
				res,
				message: 'Promotions retrieved successfully',
				data: result,
				statusCode: StatusCodes.OK,
				code: 200,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve promotions',
				statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get promotion by ID
	 * GET /api/promotions/:id
	 */
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
			return formatFail({
				res,
				message: 'Invalid promotion ID',
				statusCode: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
				code: 400,
			});
		}

		try {
			const promotion = await PromotionService.getPromotionById(value.id);

			return formatSuccess({
				res,
				message: 'Promotion retrieved successfully',
				data: promotion,
				statusCode: StatusCodes.OK,
				code: 200,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve promotion',
				statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Update promotion
	 * PUT /api/promotions/:id
	 */
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
			return formatFail({
				res,
				message: 'Invalid promotion ID',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		if (bodyValidation.error) {
			const errorMessages = bodyValidation.error.details.map(
				(err) => err.message
			);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const promotion = await PromotionService.updatePromotion(
				paramsValidation.value.id,
				bodyValidation.value
			);

			return formatSuccess({
				res,
				message: 'Promotion updated successfully',
				data: promotion,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to update promotion',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Delete promotion
	 * DELETE /api/promotions/:id
	 */
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
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			await PromotionService.deletePromotion(value.id);

			return formatSuccess({
				res,
				message: 'Promotion deleted successfully',
				data: null,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to delete promotion',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Toggle promotion status (active/inactive)
	 * PATCH /api/promotions/:id/toggle-status
	 */
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
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const promotion = await PromotionService.togglePromotionStatus(value.id);

			return formatSuccess({
				res,
				message: `Promotion ${
					promotion.isActive ? 'activated' : 'deactivated'
				} successfully`,
				data: promotion,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to toggle promotion status',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get active promotions
	 * GET /api/promotions/active
	 */
	getActivePromotions = catchAsync(async (req, res) => {
		try {
			const promotions = await PromotionService.getActivePromotions();

			return formatSuccess({
				res,
				message: 'Active promotions retrieved successfully',
				data: promotions,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve active promotions',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get promotions by product
	 * GET /api/promotions/product/:productId
	 */
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
			return formatFail({
				res,
				message: 'Invalid product ID',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const promotions = await PromotionService.getPromotionsByProduct(
				value.id
			);

			return formatSuccess({
				res,
				message: 'Product promotions retrieved successfully',
				data: promotions,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve product promotions',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Add products to promotion
	 * POST /api/promotions/:id/products
	 */
	addProductsToPromotion = catchAsync(async (req, res) => {
		const { error: paramsError, value: paramsValue } =
			PromotionValidation.promotionId.validate(req.params);

		const { error: bodyError, value: bodyValue } =
			PromotionValidation.productIds.validate(req.body);

		if (paramsError) {
			const errorMessages = paramsError.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Invalid promotion ID',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		if (bodyError) {
			const errorMessages = bodyError.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const promotion = await PromotionService.addProductsToPromotion(
				paramsValue.id,
				bodyValue.productIds
			);

			return formatSuccess({
				res,
				message: 'Products added to promotion successfully',
				data: promotion,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to add products to promotion',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Remove products from promotion
	 * DELETE /api/promotions/:id/products
	 */
	removeProductsFromPromotion = catchAsync(async (req, res) => {
		const { error: paramsError, value: paramsValue } =
			PromotionValidation.promotionId.validate(req.params);

		const { error: bodyError, value: bodyValue } =
			PromotionValidation.productIds.validate(req.body);

		if (paramsError) {
			const errorMessages = paramsError.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Invalid promotion ID',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		if (bodyError) {
			const errorMessages = bodyError.details.map((err) => err.message);
			return formatFail({
				res,
				message: 'Validation failed',
				code: StatusCodes.BAD_REQUEST,
				errors: errorMessages,
				errorCode: 'VALIDATION_ERROR',
			});
		}

		try {
			const promotion = await PromotionService.removeProductsFromPromotion(
				paramsValue.id,
				bodyValue.productIds
			);

			return formatSuccess({
				res,
				message: 'Products removed from promotion successfully',
				data: promotion,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to remove products from promotion',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get expired promotions
	 * GET /api/promotions/expired
	 */
	getExpiredPromotions = catchAsync(async (req, res) => {
		try {
			const promotions = await PromotionService.getExpiredPromotions();

			return formatSuccess({
				res,
				message: 'Expired promotions retrieved successfully',
				data: promotions,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve expired promotions',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});

	/**
	 * Get upcoming promotions
	 * GET /api/promotions/upcoming
	 */
	getUpcomingPromotions = catchAsync(async (req, res) => {
		try {
			const promotions = await PromotionService.getUpcomingPromotions();

			return formatSuccess({
				res,
				message: 'Upcoming promotions retrieved successfully',
				data: promotions,
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message || 'Failed to retrieve upcoming promotions',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
}

export default new PromotionController();
