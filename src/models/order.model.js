import { Schema, model } from "mongoose";


const orderItemSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const orderSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: "Payment"
    },
    products: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
    },
    note: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "banking", "momo", "vnpay"],
        default: "cod"
    }


}, {
    timestamps: true,
    collection: "orders"
})

const Order = model("Order", orderSchema);
export default Order;