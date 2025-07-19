import { Schema, model, Types } from 'mongoose';

const addressSchema = new Schema(
	{
		user: { type: Types.ObjectId, ref: 'User', required: true }, // Liên kết với user
		fullName: { type: String, required: true },
		phoneNumber: { type: String, required: true },
		province: { type: String, required: true },
		district: { type: String, required: true },
		ward: { type: String, required: true },
		street: { type: String, required: true },
		isDefault: { type: Boolean, default: false },
		note: { type: String },
	},
	{
		timestamps: true,
		collection: 'addresses',
	}
);

export default model('Address', addressSchema);
