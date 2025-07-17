import { Schema, model, Types } from 'mongoose';

const promotionSchema = new Schema({
	title: { type: String, required: true },
	description: String,
	applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
	discountPercent: Number,
	discountAmount: Number,
	startDate: Date,
	endDate: Date,
	isActive: { type: Boolean, default: true },
});

const Promotion = model('Promotion', promotionSchema);
export default Promotion;
