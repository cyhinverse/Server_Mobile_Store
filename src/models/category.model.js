import { Schema, Types, model } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    parentId: {
        type: Types.ObjectId,
        ref: "Category",
        default: null
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true,
    collection: "categories"
})


categorySchema.pre("save", function (next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }
    next();
})


const Category = model("Category", categorySchema);
export default Category;