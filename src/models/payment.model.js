import { Schema, Types, model } from "mongoose";

const paymentSchema = new Schema({
    user_id: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        enum: ["cod", "banking", "vnpay"],
        default: "cod"
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    transactionId: {
        type: String,
        trim: true
    },
    paidAt: {
        type: Date
    },
    responseData: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true,
    collection: "payments"
});

const Payment = model("Payment", paymentSchema);
export default Payment;
