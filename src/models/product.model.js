import { Schema, Types, model } from "mongoose";
import slugify from "slugify";

const variantSchema = new Schema({
    color: {
        type: String,
        required: true
    },
    storage: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    sku: {
        type: String,
        unique: true
    },
    image_url: {
        type: String
    }
});

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true
    },
    images: {
        type: [String],
        required: true
    },
    category_id: { type: Types.ObjectId, ref: "Category", required: true },
    variants: [variantSchema],
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }

}, {
    timestamps: true,
    collection: "products"
})


productSchema.pre("save", function (next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }
    next();
})


const Product = model("Product", productSchema);
export default Product;