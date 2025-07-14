import Variant from './variant.model.js';

class VariantService {
	constructor() {
		if (VariantService.instance) return VariantService.instance;
		this.model = Variant;
		VariantService.instance = this;
	}

	async createVariantForProduct(variantData) {
		if (!variantData) {
			throw new Error('Product ID and variant data are required');
		}
		return await this.model.create({
			...variantData,
			product_id: variantData.product_id,
		});
	}
	async getListVariantForProduct(productId) {
		if (!productId) {
			throw new Error('Product ID is required');
		}
		const variants = await this.model.find({ product_id: productId });
		if (!variants || variants.length === 0) {
			throw new Error('No variants found for this product');
		}
		return variants;
	}
	async updateVariantForProduct(variantId, variantData) {
		if (!variantId || !variantData) {
			throw new Error('Variant ID and variant data are required');
		}
		const updateVariant = await this.model.findByIdAndUpdate(
			variantId,
			{ $set: variantData },
			{ new: true }
		);
		if (!updateVariant) {
			throw new Error('Variant not found or update failed');
		}
		return updateVariant;
	}
	async deleteVariantForProduct(variantId) {
		if (!variantId) {
			throw new Error('Variant ID is required');
		}
		const deletedVariant = await this.model.findByIdAndDelete(variantId);
		if (!deletedVariant) {
			throw new Error('Variant not found or delete failed');
		}
		return deletedVariant;
	}
}

export default new VariantService();
