import { Schema, model, Types } from 'mongoose';

const discountSchema = new Schema(
	{
		code: {
			type: String,
			trim: true,
			unique: true,
			sparse: true,
		},

		isAutomatic: {
			type: Boolean,
			default: false,
		},

		description: { type: String },

		type: { type: String, enum: ['percentage', 'fixed'], required: true },
		value: { type: Number, required: true, min: 0 },

		appliesTo: {
			type: String,
			enum: ['all', 'product', 'variant'],
			default: 'all',
		},
		product_ids: [{ type: Types.ObjectId, ref: 'Product' }],
		variant_ids: [{ type: Types.ObjectId, ref: 'Variant' }],

		startDate: { type: Date },
		endDate: { type: Date },

		maxUsage: { type: Number },
		usageCount: { type: Number, default: 0 },
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
		collection: 'discounts',
	}
);

const Discount = model('Discount', discountSchema);
export default Discount;
