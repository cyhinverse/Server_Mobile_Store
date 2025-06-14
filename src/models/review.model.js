import { Schema, model, Types } from "mongoose";
const reviewSchema = new Schema({
    user_id: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    product_id: {
        type: Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: "reviews"
});

const Review = model("Review", reviewSchema);
export default Review;