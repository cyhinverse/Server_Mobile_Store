import Discount from "./discount.model.js";



class DiscountService {
    constructor() {
        if (!DiscountService.instance) return DiscountService.instance;
        this.model = Discount;
        DiscountService.instance = this;
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
                endDate: { $gte: now }
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
                endDate: { $gte: now }
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
                await Discount.updateOne({ code: discount.code }, { $inc: { usageCount: 1 } });
            }
        }

        return {
            discountedPrice,
            appliedDiscountCode
        };
    }

}

export default new DiscountService();