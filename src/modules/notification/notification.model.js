import { Schema, model, Types } from 'mongoose';

const notificationSchema = new Schema(
	{
		user_id: {
			type: Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},

		type: {
			type: String,
			required: true,
			enum: [
				'order', // Thông báo đơn hàng
				'promotion', // Khuyến mãi
				'system', // Hệ thống
				'account', // Tài khoản
				'delivery', // Vận chuyển
			],
			index: true,
		},

		title: {
			vi: { type: String, required: true },
			en: { type: String },
		},

		content: {
			vi: { type: String, required: true },
			en: { type: String },
		},

		// Dữ liệu động (tuỳ loại thông báo)
		metadata: {
			orderId: { type: Types.ObjectId, ref: 'Order' }, // Cho thông báo đơn hàng
			promotionId: { type: Types.ObjectId, ref: 'Promotion' }, // Cho khuyến mãi
			deepLink: String, // Link điều hướng trong app
			icon: String, // Icon hiển thị
		},
		status: {
			type: String,
			enum: ['unread', 'read', 'deleted'],
			default: 'unread',
			index: true,
		},

		scheduledAt: {
			type: Date,
			default: Date.now,
			index: true,
		},

		expiresAt: {
			type: Date,
			index: true,
		},

		// Độ ưu tiên (cao/thường/thấp)
		priority: {
			type: String,
			enum: ['high', 'medium', 'low'],
			default: 'medium',
		},

		// Hình ảnh đính kèm
		imageUrl: String,
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Index hỗ trợ truy vấn nhanh
notificationSchema.index({ user: 1, status: 1, createdAt: -1 });

const Notification = model('Notification', notificationSchema);

export default Notification;
