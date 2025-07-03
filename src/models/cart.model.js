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
