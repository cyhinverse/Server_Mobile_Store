import { Schema, Types, model } from 'mongoose';

const products = {
	product_id: {
		type: Types.ObjectId,
		required: true,
		ref: 'Product',
	},
	quantity: {
		type: Number,
		required: true,
		default: 1,
	},
	// Variant information (optional)
	variant_id: {
		type: String,
		required: false,
	},
	variant_sku: {
		type: String,
		required: false,
	},
	price: {
		type: Number,
		required: false,
	},
	// Optional: Store variant details for display
	variant_color: {
		type: String,
		required: false,
	},
	variant_storage: {
		type: String,
		required: false,
	},
};

const cartSchema = new Schema(
	{
		user_id: {
			type: Types.ObjectId,
			required: true,
			ref: 'User',
		},
		products: [products],
	},
	{
		timestamps: true,
		collection: 'carts',
	}
);

const Cart = model('Cart', cartSchema);
export default Cart;
