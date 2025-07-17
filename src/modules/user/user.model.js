// models/User.js

import { Schema, model, Types } from 'mongoose';

const userSchema = new Schema(
	{
		fullName: { type: String, required: true, trim: true },
		dayOfBirth: { type: Date, required: true },
		email: { type: String, required: true, unique: true },
		phoneNumber: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		isStudent: { type: Boolean, default: false },
		isTeacher: { type: Boolean, default: false },
		roles: {
			type: [String],
			default: ['user'],
			enum: ['user', 'admin'],
		},

		address_ids: [
			{
				type: Types.ObjectId,
				ref: 'Address',
			},
		],

		order_id: {
			type: Types.ObjectId,
			ref: 'Order',
		},
		cart_id: {
			type: Types.ObjectId,
			ref: 'Cart',
		},
		provider: {
			type: String,
			enum: ['google', 'facebook'],
		},
		provider_id: { type: String },
		qr_code: { type: String },
		qrExpiresAt: { type: Date },
	},
	{
		timestamps: true,
		collection: 'users',
	}
);

userSchema.index({ email: 1, phoneNumber: 1 }, { unique: true });

export default model('User', userSchema);
