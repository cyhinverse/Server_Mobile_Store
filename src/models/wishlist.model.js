import { Schema, model } from 'mongoose';

const wishListSchema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		products: [
			{
				product_id: {
					type: Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				quantity: {
					type: Number,
					default: 1,
					min: 1,
				},
			},
		],
	},
	{
		timestamps: true,
		collection: 'wishlists',
	}
);

const WishList = model('WishList', wishListSchema);
export default WishList;
