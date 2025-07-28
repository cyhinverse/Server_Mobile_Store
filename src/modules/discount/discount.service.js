import BaseService from '../../core/service/base.service.js';
import DiscountRepository from './discount.repository.js';

class DiscountService extends BaseService {
	constructor() {
		super(DiscountRepository);
	}
	async applyDiscount({ originalPrice, discountCode }) {
		const now = new Date();
		let discountedPrice = originalPrice;
		let appliedDiscountCode = null;

		let discount = null;

		if (discountCode) {
			discount = await this.repository.findOne({
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
			discount = await this.repository.findOne({
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
				await this.repository.updateOne(
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
	async getDiscountByActiveStatus(isActive) {
		if (typeof isActive !== 'boolean') {
			throw new Error('isActive must be a boolean');
		}
		const discounts = await this.repository
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
		const discounts = await this.repository
			.find({ isActive: false })
			.sort({ createdAt: -1 });
		if (!discounts || discounts.length === 0) {
			throw new Error('No discounts found with the specified inactive status');
		}
		return discounts;
	}
	async getDiscountByStartAndEndDate(startDate, endDate) {
		if (!startDate || !endDate) {
			throw new Error('Both startDate and endDate are required');
		}
		return this.repository
			.find({
				startDate: { $lte: endDate },
				endDate: { $gte: startDate },
			})
			.sort({ createdAt: -1 });
	}
}

export default new DiscountService();