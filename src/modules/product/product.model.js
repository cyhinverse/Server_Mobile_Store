import { Schema, Types, model } from 'mongoose';
import slugify from 'slugify';

const specs = new Schema({
	screenSize: { type: String, required: true },
	screenTechnology: { type: String, required: true },
	nearCamera: { type: String, required: true },
	frontCamera: { type: String, required: true },
	chipset: { type: String, required: true },
	ram: { type: String, required: true },
	currentStorage: { type: String, required: true },
	battery: { type: String, required: true },
	sim: { type: String, required: true },
	os: { type: String, required: true },
	screenResolution: { type: String, required: true },
	screenFeatures: { type: String, required: true },
	cpu: { type: String, required: true },
});

const priceSchema = new Schema(
	{
		originalPrice: { type: Number, required: true, min: 0 },
		discountedPrice: { type: Number, min: 0 },
		discountType: {
			type: String,
			enum: ['percentage', 'fixed'],
			default: 'percentage',
		},
		discountValue: { type: Number, min: 0 },
		discountStartDate: { type: Date },
		discountEndDate: { type: Date },
		discountCode: { type: String, trim: true },
		discountDescription: { type: String, trim: true },
		currency: { type: String, enum: ['VND'], default: 'VND' },
	},
	{ _id: false }
);

const variantSchema = new Schema(
	{
		product_id: { type: Types.ObjectId, ref: 'Product', required: true },
		color: String,
		storage: String,
		price: priceSchema,
		stock: { type: Number, default: 0 },
		sku: { type: String, unique: true },
		image_url: String,
	},
	{
		timestamps: true,
		collection: 'variants',
	}
);

variantSchema.index({ product_id: 1 });
variantSchema.index({ color: 1 });
variantSchema.index({ storage: 1 });
variantSchema.index({ 'price.discountCode': 1 });
variantSchema.index({ 'price.discountEndDate': 1 });
variantSchema.index({ product_id: 1, color: 1, storage: 1 }); // compound index

const productDetail = new Schema(
	{
		description: { type: String, required: true, trim: true },
		rating: { type: Number, default: 0, min: 0, max: 5 },
		images: { type: [String], required: true },
		specs: specs,
	},
	{ _id: false }
);

const productSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		price: { type: Number, required: true, min: 0 },
		thumbnail: { type: String, required: true, trim: true },
		stock: { type: Number, required: true, min: 0 },
		sold: { type: Number, default: 0 },
		status: {
			type: String,
			enum: ['active', 'out_of_stock', 'disabled'],
			default: 'active',
		},
		category_id: { type: Types.ObjectId, ref: 'Category', required: true },
		slug: { type: String, unique: true, trim: true },
		isNewProduct: { type: Boolean, default: false },
		isFeatured: { type: Boolean, default: false },
		productDetail: productDetail,
	},
	{
		timestamps: true,
		collection: 'products',
	}
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category_id: 1 });
productSchema.index({ name: 'text', 'productDetail.description': 'text' });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewProduct: 1 });

productSchema.pre('save', function (next) {
	if (!this.slug && this.name) {
		this.slug = slugify(this.name, {
			lower: true,
			strict: true,
		});
	}
	next();
});

const Product = model('Product', productSchema);
const Variant = model('Variant', variantSchema);

export { Product, Variant };
