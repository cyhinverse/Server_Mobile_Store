import { Schema, model, Types } from 'mongoose';

const priceSchema = new Schema(
	{
		originalPrice: { type: Number, required: true, min: 0 },
		currency: { type: String, enum: ['VND'], default: 'VND' },
	},
	{ _id: false }
);



const variantSchema = new Schema(
	{
		product_id: { type: Types.ObjectId, ref: 'Product', required: true },
		color: String,
		storage: String,
		price: priceSchema,
		stock: { type: Number, default: 0 },
		sku: { type: String, unique: true },
		image_url: String,
	},
	{
		timestamps: true,
		collection: 'variants',
	}
);

variantSchema.index({ product_id: 1 });
variantSchema.index({ color: 1 });
variantSchema.index({ storage: 1 });
variantSchema.index({ 'price.discountCode': 1 });
variantSchema.index({ 'price.discountEndDate': 1 });
variantSchema.index({ product_id: 1, color: 1, storage: 1 });

const Variant = model('Variant', variantSchema);

export default Variant;
