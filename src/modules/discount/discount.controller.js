import DiscountService from './discount.service.js';
import { catchAsync } from '../../configs/catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class DiscountController {
	constructor() {
		if (!DiscountController.instance) return DiscountController.instance;
		DiscountController.instance = this;
		this.service = DiscountService;
	}
	createDiscount = catchAsync(async (req, res) => {
		const {
			code,
			isAutomatic,
			description,
			type,
			value,
			appliesTo,
			product_ids,
			variant_ids,
			startDate,
			endDate,
			usageCount,
			isActive,
			maxUsage,
		} = req.body;
		if (!type || !value) {
			return formatFail({
				res,
				message: 'Type and value are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const discount = await this.service.createDiscount({
			code,
			isAutomatic,
			description,
			type,
			value,
			appliesTo,
			product_ids,
			variant_ids,
			startDate,
			endDate,
			usageCount,
			isActive,
			maxUsage,
		});
		return formatSuccess({
			res,
			data: discount,
			message: 'Discount created successfully',
			code: StatusCodes.CREATED,
		});
	});
	updateDiscount = catchAsync(async (req, res) => {
		const { id } = req.params;
		const data = req.body;

		if (!id) {
			return formatFail({
				res,
				message: 'Discount ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const discount = await this.service.updateDiscount(id, data);

		if (!discount) {
			return formatFail({
				res,
				message: 'Discount not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			data: discount,
			message: 'Discount updated successfully',
			code: StatusCodes.OK,
		});
	});
	applyDiscount = catchAsync(async (req, res) => {
		const { originalPrice, discountCode } = req.body;

		if (!originalPrice || !discountCode) {
			return formatFail({
				res,
				message: 'Original price and discount code are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const result = await this.service.applyDiscount({
			originalPrice,
			discountCode,
		});

		return formatSuccess({
			res,
			data: result,
			message: 'Discount applied successfully',
			code: StatusCodes.OK,
		});
	});
	deleteDiscount = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail({
				res,
				message: 'Discount ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const discount = await this.service.deleteDiscount(id);

		if (!discount) {
			return formatFail({
				res,
				message: 'Discount not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			data: discount,
			message: 'Discount deleted successfully',
			code: StatusCodes.OK,
		});
	});
	getDiscounts = catchAsync(async (req, res) => {
		const discounts = await this.service.getAllDiscounts();
		if (!discounts || discounts.length === 0) {
			return formatFail({
				res,
				message: 'No discounts found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: discounts,
			message: 'Discounts retrieved successfully',
			code: StatusCodes.OK,
		});
	});
	getDiscountByActiveStatus = catchAsync(async (req, res) => {
		const { isActive } = req.query;
		const discounts = await this.service.getDiscountByActiveStatus(
			isActive === 'true'
		);
		return formatSuccess({
			res,
			data: discounts,
			message: 'Active discounts retrieved successfully',
			code: StatusCodes.OK,
		});
	});
	getDiscountByNotActiveStatus = catchAsync(async (req, res) => {
		const { isActive } = req.query;
		const discounts = await this.service.getDiscountByNotActiveStatus(
			isActive === 'false'
		);
		return formatSuccess({
			res,
			data: discounts,
			message: 'Inactive discounts retrieved successfully',
			code: StatusCodes.OK,
		});
	});
	getDiscountById = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return formatFail({
				res,
				message: 'Discount ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const discount = await this.service.getDiscountById(id);
		if (!discount) {
			return formatFail({
				res,
				message: 'Discount not found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: discount,
			message: 'Discount retrieved successfully',
			code: StatusCodes.OK,
		});
	});
	getDiscountByStartAndEndDate = catchAsync(async (req, res) => {
		const { startDate, endDate } = req.query;

		if (!startDate || !endDate) {
			return formatFail({
				res,
				message: 'Start date and end date are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const discounts = await this.service.getDiscountByStartAndEndDate(
			startDate,
			endDate
		);
		return formatSuccess({
			res,
			data: discounts,
			message: 'Discounts by date range retrieved successfully',
			code: StatusCodes.OK,
		});
	});
}

export default new DiscountController();
