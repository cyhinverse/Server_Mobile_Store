import notificationService from '../modules/notification/notification.service.js';

/**
 * Helper class để các module khác có thể gửi notification dễ dàng
 */
class NotificationHelper {
	/**
	 * Gửi thông báo khi đơn hàng thay đổi trạng thái
	 */
	static async sendOrderStatusNotification(
		userId,
		orderId,
		orderStatus,
		orderData
	) {
		try {
			return await notificationService.createOrderNotification(
				userId,
				orderId,
				orderStatus,
				orderData
			);
		} catch (error) {
			console.error('Error sending order notification:', error.message);
		}
	}

	/**
	 * Gửi thông báo khuyến mãi
	 */
	static async sendPromotionNotification(userId, promotionId, promotionData) {
		try {
			return await notificationService.createPromotionNotification(
				userId,
				promotionId,
				promotionData
			);
		} catch (error) {
			console.error('Error sending promotion notification:', error.message);
		}
	}

	/**
	 * Gửi thông báo khuyến mãi cho nhiều user
	 */
	static async sendPromotionNotificationToUsers(
		userIds,
		promotionId,
		promotionData
	) {
		try {
			const promises = userIds.map((userId) =>
				this.sendPromotionNotification(userId, promotionId, promotionData)
			);
			return await Promise.allSettled(promises);
		} catch (error) {
			console.error(
				'Error sending bulk promotion notifications:',
				error.message
			);
		}
	}

	/**
	 * Gửi thông báo chào mừng user mới
	 */
	static async sendWelcomeNotification(userId, userData) {
		try {
			const title = {
				vi: 'Chào mừng bạn đến với Mobile Store!',
				en: 'Welcome to Mobile Store!',
			};

			const content = {
				vi: `Xin chào ${userData.fullName}! Cảm ơn bạn đã đăng ký tài khoản. Hãy khám phá những sản phẩm tuyệt vời của chúng tôi.`,
				en: `Hello ${userData.fullName}! Thank you for registering. Explore our amazing products.`,
			};

			return await notificationService.createNotification({
				user: userId,
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
			console.error('Error sending welcome notification:', error.message);
		}
	}

	/**
	 * Gửi thông báo xác nhận thanh toán
	 */
	static async sendPaymentConfirmationNotification(userId, paymentData) {
		try {
			const title = {
				vi: 'Thanh toán thành công',
				en: 'Payment successful',
			};

			const content = {
				vi: `Thanh toán ${paymentData.amount.toLocaleString(
					'vi-VN'
				)}đ cho đơn hàng #${paymentData.orderNumber} đã được xử lý thành công.`,
				en: `Payment of ${paymentData.amount.toLocaleString()}đ for order #${
					paymentData.orderNumber
				} has been processed successfully.`,
			};

			return await notificationService.createNotification({
				user: userId,
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
			console.error(
				'Error sending payment confirmation notification:',
				error.message
			);
		}
	}

	/**
	 * Gửi thông báo hệ thống tới tất cả user active
	 */
	static async sendSystemNotificationToAllUsers(title, content, metadata = {}) {
		try {
			// Cần import User model để lấy danh sách user active
			// Giả sử có service để lấy active users
			const activeUserIds = await this.getActiveUserIds();

			return await notificationService.createSystemNotification(
				activeUserIds,
				title,
				content,
				metadata
			);
		} catch (error) {
			console.error(
				'Error sending system notification to all users:',
				error.message
			);
		}
	}

	/**
	 * Gửi thông báo nhắc nhở giỏ hàng bỏ quên
	 */
	static async sendAbandonedCartNotification(userId, cartData) {
		try {
			const title = {
				vi: 'Bạn có sản phẩm đang chờ trong giỏ hàng',
				en: 'You have items waiting in your cart',
			};

			const content = {
				vi: `Bạn có ${cartData.itemCount} sản phẩm trong giỏ hàng. Hoàn tất đơn hàng ngay để không bỏ lỡ!`,
				en: `You have ${cartData.itemCount} items in your cart. Complete your order now!`,
			};

			return await notificationService.createNotification({
				user: userId,
				type: 'system',
				title,
				content,
				metadata: {
					deepLink: '/cart',
					icon: 'cart',
				},
				priority: 'low',
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			});
		} catch (error) {
			console.error(
				'Error sending abandoned cart notification:',
				error.message
			);
		}
	}

	/**
	 * Gửi thông báo sản phẩm yêu thích có khuyến mãi
	 */
	static async sendWishlistPromotionNotification(
		userId,
		productData,
		promotionData
	) {
		try {
			const title = {
				vi: 'Sản phẩm yêu thích của bạn đang giảm giá!',
				en: 'Your favorite product is on sale!',
			};

			const content = {
				vi: `${productData.name} đang giảm ${promotionData.discountValue}%. Mua ngay kẻo lỡ!`,
				en: `${productData.name} is ${promotionData.discountValue}% off. Buy now!`,
			};

			return await notificationService.createNotification({
				user: userId,
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
			console.error(
				'Error sending wishlist promotion notification:',
				error.message
			);
		}
	}

	/**
	 * Helper method để lấy danh sách active user IDs
	 * Cần implement dựa trên User model của project
	 */
	static async getActiveUserIds() {
		try {
			// This would need to be implemented based on your User model
			// Return array of active user IDs
			return [];
		} catch (error) {
			console.error('Error getting active user IDs:', error.message);
			return [];
		}
	}
}

export default NotificationHelper;
