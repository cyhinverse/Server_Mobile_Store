import notificationService from '../modules/notification/notification.service.js';

/**
 * Helper gửi thông báo cho các module khác
 */
class NotificationHelper {
	// Đơn hàng thay đổi trạng thái
	static async sendOrderStatus(userId, orderId, status, orderData) {
		try {
			return await notificationService.createOrderNotification(
				userId,
				orderId,
				status,
				orderData
			);
		} catch (error) {
			console.error('🔴 Lỗi gửi thông báo đơn hàng:', error);
		}
	}

	// Khuyến mãi cho 1 user
	static async sendPromotion(userId, promotionId, promotionData) {
		try {
			return await notificationService.createPromotionNotification(
				userId,
				promotionId,
				promotionData
			);
		} catch (error) {
			console.error('🔴 Lỗi gửi thông báo khuyến mãi:', error);
		}
	}

	// Khuyến mãi cho nhiều user
	static async sendPromotionToMany(userIds, promotionId, promotionData) {
		try {
			const tasks = userIds.map((id) =>
				this.sendPromotion(id, promotionId, promotionData)
			);
			return await Promise.allSettled(tasks);
		} catch (error) {
			console.error('🔴 Lỗi gửi khuyến mãi hàng loạt:', error);
		}
	}

	// Gửi chào mừng
	static async sendWelcome(userId, userData) {
		try {
			const title = {
				vi: 'Chào mừng bạn đến với Mobile Store!',
				en: 'Welcome to Mobile Store!',
			};

			const content = {
				vi: `Xin chào ${userData.fullName}! Cảm ơn bạn đã đăng ký tài khoản.`,
				en: `Hello ${userData.fullName}! Thank you for registering.`,
			};

			return await notificationService.createNotification({
				userId,
				type: 'account',
				title,
				content,
				metadata: {
					deepLink: '/home',
					icon: 'welcome',
				},
				priority: 'medium',
			});
		} catch (error) {
			console.error('🔴 Lỗi gửi thông báo chào mừng:', error);
		}
	}

	// Gửi xác nhận thanh toán
	static async sendPaymentConfirmation(userId, paymentData) {
		try {
			const title = {
				vi: 'Thanh toán thành công',
				en: 'Payment successful',
			};

			const content = {
				vi: `Bạn đã thanh toán ${paymentData.amount.toLocaleString(
					'vi-VN'
				)}đ cho đơn hàng #${paymentData.orderNumber}.`,
				en: `You've paid ${paymentData.amount.toLocaleString()}đ for order #${
					paymentData.orderNumber
				}.`,
			};

			return await notificationService.createNotification({
				userId,
				type: 'order',
				title,
				content,
				metadata: {
					orderId: paymentData.orderId,
					deepLink: `/orders/${paymentData.orderId}`,
					icon: 'payment',
				},
				priority: 'high',
			});
		} catch (error) {
			console.error('🔴 Lỗi gửi xác nhận thanh toán:', error);
		}
	}

	// Gửi thông báo hệ thống
	static async sendSystemToAll(title, content, metadata = {}) {
		try {
			const userIds = await this.getActiveUserIds();
			return await notificationService.createSystemNotification(
				userIds,
				title,
				content,
				metadata
			);
		} catch (error) {
			console.error('🔴 Lỗi gửi thông báo hệ thống:', error);
		}
	}

	// Nhắc nhở giỏ hàng bỏ quên
	static async sendAbandonedCart(userId, cartData) {
		try {
			const title = {
				vi: 'Bạn có sản phẩm đang chờ trong giỏ hàng',
				en: 'You have items waiting in your cart',
			};

			const content = {
				vi: `Có ${cartData.itemCount} sản phẩm trong giỏ hàng của bạn.`,
				en: `You have ${cartData.itemCount} items in your cart.`,
			};

			return await notificationService.createNotification({
				userId,
				type: 'system',
				title,
				content,
				metadata: {
					deepLink: '/cart',
					icon: 'cart',
				},
				priority: 'low',
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			});
		} catch (error) {
			console.error('🔴 Lỗi nhắc giỏ hàng:', error);
		}
	}

	// Gửi thông báo sản phẩm yêu thích có khuyến mãi
	static async sendWishlistPromo(userId, productData, promotionData) {
		try {
			const title = {
				vi: 'Sản phẩm yêu thích của bạn đang giảm giá!',
				en: 'Your favorite product is on sale!',
			};

			const content = {
				vi: `${productData.name} đang giảm ${promotionData.discountValue}%.`,
				en: `${productData.name} is ${promotionData.discountValue}% off.`,
			};

			return await notificationService.createNotification({
				userId,
				type: 'promotion',
				title,
				content,
				metadata: {
					productId: productData.id,
					promotionId: promotionData.id,
					deepLink: `/products/${productData.id}`,
					icon: 'wishlist',
				},
				priority: 'medium',
				expiresAt: promotionData.endDate,
			});
		} catch (error) {
			console.error('🔴 Lỗi wishlist promotion:', error);
		}
	}

	// Giả lập: lấy user active
	static async getActiveUserIds() {
		try {
			// TODO: Replace bằng UserService.getAllActiveIds()
			return []; // tạm thời
		} catch (error) {
			console.error('🔴 Lỗi lấy danh sách user:', error);
			return [];
		}
	}
}

export default NotificationHelper;
