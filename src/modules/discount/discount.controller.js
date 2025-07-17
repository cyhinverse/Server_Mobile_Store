import DiscountService from './discount.service.js';
import catchAsync from '../../configs/catchAsync.js';

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
			return res.status(400).json({
				status: 'fail',
				message: 'Type and value are required',
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
		res.status(201).json({
			status: 'success',
			data: {
				discount,
			},
		});
	});
	updateDiscount = catchAsync(async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		const discount = await this.service.updateDiscount(id, data);
		res.status(200).json({
			status: 'success',
			data: {
				discount,
			},
		});
	});
	applyDiscount = catchAsync(async (req, res) => {
		const { originalPrice, discountCode } = req.body;
		const result = await this.service.applyDiscount({
			originalPrice,
			discountCode,
		});
		res.status(200).json({
			status: 'success',
			data: result,
		});
	});
	deleteDiscount = catchAsync(async (req, res) => {
		const { id } = req.params;
		const discount = await this.service.deleteDiscount(id);
		res.status(200).json({
			status: 'success',
			data: {
				discount,
			},
		});
	});
	getDiscounts = catchAsync(async (req, res) => {
		const discounts = await this.service.getAllDiscounts();
		if (!discounts || discounts.length === 0) {
			return res.status(404).json({
				message: 'No discounts found',
				success: false,
			});
		}
		res.status(200).json({
			status: 'success',
			data: {
				discounts,
			},
		});
	});
	getDiscountByActiveStatus = catchAsync(async (req, res) => {
		const { isActive } = req.query;
		const discounts = await this.service.getDiscountByActiveStatus(
			isActive === 'true'
		);
		res.status(200).json({
			status: 'success',
			data: {
				discounts,
			},
		});
	});
	getDiscountByNotActiveStatus = catchAsync(async (req, res) => {
		const { isActive } = req.query;
		const discounts = await this.service.getDiscountByNotActiveStatus(
			isActive === 'false'
		);
		res.status(200).json({
			status: 'success',
			data: {
				discounts,
			},
		});
	});
	getDiscountById = catchAsync(async (req, res) => {
		const { id } = req.params;
		const discount = await this.service.getDiscountById(id);
		if (!discount) {
			return res.status(404).json({
				message: 'Discount not found',
				success: false,
			});
		}
		res.status(200).json({
			status: 'success',
			data: {
				discount,
			},
		});
	});
	getDiscountByStartAndEndDate = catchAsync(async (req, res) => {
		const { startDate, endDate } = req.query;
		const discounts = await this.service.getDiscountByStartAndEndDate(
			startDate,
			endDate
		);
		res.status(200).json({
			status: 'success',
			data: {
				discounts,
			},
		});
	});
}

export default new DiscountController();
