import { Schema, Types, model } from 'mongoose';
import slugify from 'slugify';

const specs = new Schema({
	screenSize: {
		type: String,
		required: true,
	},
	screenTechnology: {
		type: String,
		required: true,
	},
	nearCamera: {
		type: String,
		required: true,
	},
	frontCamera: {
		type: String,
		required: true,
	},
	chipset: {
		type: String,
		required: true,
	},
	ram: {
		type: String,
		required: true,
	},
	currentStorage: {
		type: String,
		required: true,
	},
	battery: {
		type: String,
		required: true,
	},
	sim: {
		type: String,
		required: true,
	},
	os: {
		type: String,
		required: true,
	},
	screenResolution: {
		type: String,
		required: true,
	},
	screenFeatures: {
		type: String,
		required: true,
	},
	cpu: {
		type: String,
		required: true,
	},
});

const priceSchema = new Schema(
	{
		originalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		discountedPrice: {
			type: Number,
			min: 0,
		},
		discountType: {
			type: String,
			enum: ['percentage', 'fixed'],
			default: 'percentage',
		},
		discountValue: {
			type: Number,
			min: 0,
		},
		discountStartDate: {
			type: Date,
		},
		discountEndDate: {
			type: Date,
		},
		discountCode: {
			type: String,
			trim: true,
		},
		discountDescription: {
			type: String,
			trim: true,
		},
		currency: {
			type: String,
			enum: ['VND'],
			default: 'VND',
		},
	},
	{ _id: false }
);

const variantSchema = new Schema({
	color: {
		type: String,
		required: true,
	},
	storage: {
		type: String,
		required: true,
	},
	price: priceSchema,
	stock: {
		type: Number,
		default: 0,
	},
	sku: {
		type: String,
		unique: true,
	},
	image_url: {
		type: String,
	},
	specs: specs,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

const productSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		thumbnail: {
			type: String,
			required: true,
			trim: true,
		},
		stock: {
			type: Number,
			required: true,
			min: 0,
		},
		sold: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			enum: ['active', 'out_of_stock', 'disabled'],
			default: 'active',
		},

		category_id: { type: Types.ObjectId, ref: 'Category', required: true },
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		isNew: {
			type: Boolean,
			default: false,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		detail_id: {
			type: Types.ObjectId,
			ref: 'ProductDetail',
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
		collection: 'products',
	}
);

const productDetailSchema = new Schema({
	product_id: {
		ref: 'Product',
		type: Types.ObjectId,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	rating: {
		type: Number,
		default: 0,
		min: 0,
		max: 5,
	},
	images: {
		type: [String],
		required: true,
	},

	variants: [variantSchema],
});

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
const ProductDetail = model('ProductDetail', productDetailSchema);
export { Product, ProductDetail };
