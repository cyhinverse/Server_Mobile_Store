import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema(
	{
		variant_id: {
			type: Schema.Types.ObjectId,
			ref: 'Variant',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		color: {
			type: String,
		},
		storage: {
			type: String,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		price: {
			originalPrice: {
				type: Number,
				required: true,
				min: 0,
			},
			discountedPrice: {
				type: Number,
				required: true,
				min: 0,
			},
			discountCode: {
				type: String,
			},
		},
	},
	{ _id: false }
);

const orderSchema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		payment_id: {
			type: Schema.Types.ObjectId,
			ref: 'Payment',
		},
		products: [orderItemSchema],
		totalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ['pending', 'completed', 'cancelled'],
			default: 'pending',
		},
		note: {
			type: String,
			trim: true,
		},
		payment_method: {
			type: String,
			enum: ['cod', 'banking', 'vnpay'],
			default: 'cod',
		},
	},
	{
		timestamps: true,
		collection: 'orders',
	}
);

const Order = model('Order', orderSchema);
export default Order;
