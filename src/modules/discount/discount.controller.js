import { catchAsync } from '../../configs/catchAsync.js';
import BaseController from '../../core/controller/base.controller.js';
import DiscountService from './discount.service.js';

class DiscountController extends BaseController {
	constructor() {
		super(DiscountService);
	}
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