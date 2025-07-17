import Discount from './discount.model.js';

class DiscountService {
	constructor() {
		if (!DiscountService.instance) return DiscountService.instance;
		this.model = Discount;
		DiscountService.instance = this;
	}
	async createDiscount({
		code,
		isAutomatic,
		description,
		type,
		value,
		appliesTo,
		product_ids = [],
		variant_ids = [],
		startDate,
		endDate,
		usageCount = 0,
		isActive = true,
		maxUsage,
	}) {
		const discount = await this.model.create({
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
		if (!discount) throw new Error('Failed to create discount');
		return await discount.save();
	}
	async updateDiscount(id, data) {
		if (!id) throw new Error('Discount ID is required');
		if (!data || Object.keys(data).length === 0) {
			throw new Error('No update data provided');
		}
		const discount = await this.model.findByIdAndUpdate(id, data, {
			new: true,
		});
		if (!discount) throw new Error('Discount not found');
		return discount;
	}
	async applyDiscount({ originalPrice, discountCode }) {
		const now = new Date();
		let discountedPrice = originalPrice;
		let appliedDiscountCode = null;

		let discount = null;

		if (discountCode) {
			discount = await Discount.findOne({
				code: discountCode,
				isActive: true,
				startDate: { $lte: now },
				endDate: { $gte: now },
			});
			if (!discount) throw new Error('Invalid discount code');

			if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
				throw new Error('Discount usage limit exceeded');
			}
		} else {
			discount = await Discount.findOne({
				isAutomatic: true,
				isActive: true,
				startDate: { $lte: now },
				endDate: { $gte: now },
			});
		}

		if (discount) {
			if (discount.type === 'percentage') {
				discountedPrice -= (originalPrice * discount.value) / 100;
			} else if (discount.type === 'fixed') {
				discountedPrice -= discount.value;
			}

			if (discountedPrice < 0) discountedPrice = 0;

			appliedDiscountCode = discountCode ? discount.code : '[AUTO]';

			if (discountCode) {
				await Discount.updateOne(
					{ code: discount.code },
					{ $inc: { usageCount: 1 } }
				);
			}
		}

		return {
			discountedPrice,
			appliedDiscountCode,
		};
	}
	async deleteDiscount(id) {
		if (!id) throw new Error('Discount ID is required');
		const discount = await this.model.findByIdAndDelete(id);
		if (!discount) throw new Error('Discount not found');
		return discount;
	}
	async getAllDiscounts() {
		const discounts = await this.model.find().sort({ createdAt: -1 });
		if (!discounts || discounts.length === 0) {
			throw new Error('No discounts found');
		}
		return discounts;
	}
	async getDiscountByActiveStatus(isActive) {
		if (typeof isActive !== 'boolean') {
			throw new Error('isActive must be a boolean');
		}
		const discounts = await this.model
			.find({ isActive })
			.sort({ createdAt: -1 });
		if (!discounts || discounts.length === 0) {
			throw new Error('No discounts found with the specified active status');
		}
		return discounts;
	}
	async getDiscountByNotActiveStatus(isActive) {
		if (typeof isActive !== 'boolean') {
			throw new Error('isActive must be a boolean');
		}
		const discounts = await this.model
			.find({ isActive: false })
			.sort({ createdAt: -1 });
		if (!discounts || discounts.length === 0) {
			throw new Error('No discounts found with the specified inactive status');
		}
		return discounts;
	}
	async getDiscountById(id) {
		if (!id) throw new Error('Discount ID is required');
		const discount = await this.model.findById(id);
		if (!discount) throw new Error('Discount not found');
		return discount;
	}
	async getDiscountByStartAndEndDate(startDate, endDate) {
		if (!startDate || !endDate) {
			throw new Error('Both startDate and endDate are required');
		}
		return this.model
			.find({
				startDate: { $lte: endDate },
				endDate: { $gte: startDate },
			})
			.sort({ createdAt: -1 });
	}
}

export default new DiscountService();
