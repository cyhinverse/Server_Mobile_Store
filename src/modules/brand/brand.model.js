import { Schema, model } from 'mongoose';

const brandSchema = new Schema(
	{
		name: { type: String, required: true, unique: true }, // Tên thương hiệu: "Apple"
		logo: { type: String }, // URL ảnh logo thương hiệu
		description: { type: String }, // Mô tả thêm (tùy chọn)
		isActive: { type: Boolean, default: true }, // Thương hiệu còn hiển thị hay không
	},
	{ timestamps: true, collection: 'brands' }
);

const Brand = model('Brand', brandSchema);
export default Brand;
