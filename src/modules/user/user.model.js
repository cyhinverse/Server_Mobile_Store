import { Schema, model, Types } from 'mongoose';

const addressSchema = new Schema({
	user: { type: Types.ObjectId, ref: 'User', required: true },
	fullName: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	province: { type: String, required: true },
	district: { type: String, required: true },
	ward: { type: String, required: true },
	street: { type: String, required: true },
	isDefault: { type: Boolean, default: false },
	note: { type: String },
});

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
			type: String,
			default: 'user',
			enum: ['user', 'admin'],
		},
		permissions: {
			type: [String],
			default: [],
		},
		address: [addressSchema],

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
		codeVerify: { type: String, default: '' },
		codeExpiresAt: { type: Date, default: null },
		verifyEmail: { type: Boolean, default: false },
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
