import cron from 'node-cron';
import notificationService from '../modules/notification/notification.service.js';
import { sendEmail } from '../configs/config.nodemailer.js';
import cartModel from '../modules/cart/cart.model.js';
import userModel from '../modules/user/user.model.js';
import discountModel from '../modules/discount/discount.model.js';

/**
 * Job dọn dẹp thông báo hết hạn
 * Chạy hàng ngày lúc 2:00 AM
 */
const cleanupExpiredNotificationsJob = () => {
	cron.schedule(
		'0 2 * * *',
		async () => {
			try {
				console.log('Starting cleanup of expired notifications...');

				const result = await notificationService.cleanupExpiredNotifications();

				console.log(
					`Cleanup completed. Deleted ${result.deletedCount} expired notifications.`
				);
			} catch (error) {
				console.error('Error during notification cleanup:', error.message);
			}
		},
		{
			scheduled: true,
			timezone: 'Asia/Ho_Chi_Minh',
		}
	);
};

/**
 * Job gửi thông báo nhắc nhở giỏ hàng bỏ quên
 * Chạy hàng ngày lúc 10:00 AM và 7:00 PM
 */
const abandonedCartReminderJob = () => {
	cron.schedule(
		'0 10,19 * * *',
		async () => {
			try {
				console.log('Starting abandoned cart reminder job...');

				// Tìm các giỏ hàng không được cập nhật trong 24 giờ qua
				const oneDayAgo = new Date();
				oneDayAgo.setHours(oneDayAgo.getHours() - 24);

				const abandonedCarts = await cartModel
					.find({
						updatedAt: { $lt: oneDayAgo },
						items: { $exists: true, $not: { $size: 0 } },
					})
					.populate('user_id', 'email fullName')
					.lean();

				for (const cart of abandonedCarts) {
					if (cart.user_id?.email) {
						// Gửi email nhắc nhở
						await sendEmail({
							to: cart.user_id.email,
							subject: 'Bạn có sản phẩm đang chờ trong giỏ hàng! 🛒',
							html: `
								<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
									<h2>Xin chào ${cart.user_id.fullName || 'Khách hàng'},</h2>
									<p>Bạn có <strong>${
										cart.items.length
									} sản phẩm</strong> đang chờ trong giỏ hàng.</p>
									<p>Đừng để chúng chờ lâu nữa nhé! Hãy hoàn tất đơn hàng để nhận được những sản phẩm tuyệt vời này.</p>
									<a href="${process.env.FRONTEND_URL}/cart" 
									   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
										Xem giỏ hàng
									</a>
									<p>Cảm ơn bạn đã tin tương và lựa chọn chúng tôi!</p>
								</div>
							`,
						});

						// Tạo thông báo trong app
						await notificationService.createNotification({
							user_id: cart.user_id._id,
							type: 'cart_reminder',
							title: 'Giỏ hàng chờ bạn!',
							message: `Bạn có ${cart.items.length} sản phẩm trong giỏ hàng. Hãy hoàn tất đơn hàng ngay!`,
							metadata: {
								cartItemCount: cart.items.length,
							},
						});
					}
				}

				console.log(
					`Abandoned cart reminder sent to ${abandonedCarts.length} users.`
				);
			} catch (error) {
				console.error(
					'Error during abandoned cart reminder job:',
					error.message
				);
			}
		},
		{
			scheduled: true,
			timezone: 'Asia/Ho_Chi_Minh',
		}
	);
};

/**
 * Job gửi thông báo discount hàng tuần
 * Chạy vào thứ 2 hàng tuần lúc 9:00 AM
 */
const weeklyDiscountNotificationJob = () => {
	cron.schedule(
		'0 9 * * 1',
		async () => {
			try {
				console.log('Starting weekly discount notification job...');

				// Lấy các discount đang active
				const activeDiscounts = await discountModel
					.find({
						isActive: true,
						startDate: { $lte: new Date() },
						endDate: { $gte: new Date() },
					})
					.lean();

				if (activeDiscounts.length === 0) {
					console.log('No active discounts found.');
					return;
				}

				// Lấy tất cả users active
				const users = await userModel
					.find({ isActive: true })
					.select('email fullName')
					.lean();

				for (const user of users) {
					if (user.email) {
						// Gửi email discount
						await sendEmail({
							to: user.email,
							subject: '🎉 Ưu đại hấp dẫn tuần này - Đừng bỏ lỡ!',
							html: generateDiscountEmailTemplate(
								user.fullName,
								activeDiscounts
							),
						});

						// Tạo thông báo trong app
						await notificationService.createNotification({
							user_id: user._id,
							type: 'discount_weekly',
							title: 'Ưu đãi tuần mới!',
							message: `${activeDiscounts.length} ưu đãi hấp dẫn đang chờ bạn. Mua sắm ngay!`,
							metadata: {
								discountCount: activeDiscounts.length,
								discounts: activeDiscounts.map((d) => ({
									id: d._id,
									code: d.code,
									value: d.discountValue,
									type: d.discountType,
								})),
							},
						});
					}
				}

				console.log(
					`Weekly discount notification sent to ${users.length} users.`
				);
			} catch (error) {
				console.error(
					'Error during weekly discount notification job:',
					error.message
				);
			}
		},
		{
			scheduled: true,
			timezone: 'Asia/Ho_Chi_Minh',
		}
	);
};

/**
 * Job gửi email sinh nhật với discount đặc biệt
 * Chạy hàng ngày lúc 8:00 AM
 */
const birthdayDiscountJob = () => {
	cron.schedule(
		'0 8 * * *',
		async () => {
			try {
				console.log('Starting birthday discount job...');

				const today = new Date();
				const todayMonth = today.getMonth() + 1;
				const todayDate = today.getDate();

				// Tìm users có sinh nhật hôm nay
				const birthdayUsers = await userModel
					.find({
						isActive: true,
						$expr: {
							$and: [
								{ $eq: [{ $month: '$dateOfBirth' }, todayMonth] },
								{ $eq: [{ $dayOfMonth: '$dateOfBirth' }, todayDate] },
							],
						},
					})
					.select('email fullName dateOfBirth')
					.lean();

				for (const user of birthdayUsers) {
					if (user.email) {
						// Tạo mã discount sinh nhật
						const birthdayDiscountCode = `BIRTHDAY${user._id
							.toString()
							.slice(-6)
							.toUpperCase()}`;

						// Gửi email sinh nhật
						await sendEmail({
							to: user.email,
							subject: '🎂 Chúc mừng sinh nhật! Quà tặng đặc biệt dành cho bạn',
							html: generateBirthdayEmailTemplate(
								user.fullName,
								birthdayDiscountCode
							),
						});

						// Tạo thông báo sinh nhật
						await notificationService.createNotification({
							user_id: user._id,
							type: 'birthday_discount',
							title: 'Chúc mừng sinh nhật! 🎉',
							message:
								'Bạn nhận được mã giảm giá 20% đặc biệt nhân dịp sinh nhật!',
							metadata: {
								discountCode: birthdayDiscountCode,
								discountValue: 20,
								validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
							},
						});
					}
				}

				console.log(`Birthday discount sent to ${birthdayUsers.length} users.`);
			} catch (error) {
				console.error('Error during birthday discount job:', error.message);
			}
		},
		{
			scheduled: true,
			timezone: 'Asia/Ho_Chi_Minh',
		}
	);
};

/**
 * Job thông báo discount sắp hết hạn
 * Chạy hàng ngày lúc 6:00 PM
 */
const discountExpiryReminderJob = () => {
	cron.schedule(
		'0 18 * * *',
		async () => {
			try {
				console.log('Starting discount expiry reminder job...');

				const tomorrow = new Date();
				tomorrow.setDate(tomorrow.getDate() + 1);
				tomorrow.setHours(23, 59, 59, 999);

				// Tìm discount sắp hết hạn trong 24h
				const expiringDiscounts = await discountModel
					.find({
						isActive: true,
						endDate: { $lte: tomorrow, $gte: new Date() },
					})
					.lean();

				if (expiringDiscounts.length === 0) {
					console.log('No expiring discounts found.');
					return;
				}

				// Lấy tất cả users
				const users = await userModel
					.find({ isActive: true })
					.select('email fullName')
					.lean();

				for (const user of users) {
					if (user.email) {
						// Gửi email nhắc nhở
						await sendEmail({
							to: user.email,
							subject: '⏰ Ưu đãi sắp hết hạn - Nhanh tay đặt hàng!',
							html: generateExpiryReminderEmailTemplate(
								user.fullName,
								expiringDiscounts
							),
						});

						// Tạo thông báo
						await notificationService.createNotification({
							user_id: user._id,
							type: 'discount_expiry',
							title: 'Ưu đãi sắp hết hạn!',
							message: `${expiringDiscounts.length} ưu đãi sẽ hết hạn trong 24h. Mua sắm ngay!`,
							metadata: {
								expiringDiscounts: expiringDiscounts.map((d) => ({
									code: d.code,
									value: d.discountValue,
									endDate: d.endDate,
								})),
							},
						});
					}
				}

				console.log(`Discount expiry reminder sent to ${users.length} users.`);
			} catch (error) {
				console.error(
					'Error during discount expiry reminder job:',
					error.message
				);
			}
		},
		{
			scheduled: true,
			timezone: 'Asia/Ho_Chi_Minh',
		}
	);
};

/**
 * Helper function - Template email discount hàng tuần
 */
const generateDiscountEmailTemplate = (userName, discounts) => {
	const discountList = discounts
		.map(
			(discount) => `
		<div style="border: 1px solid #ddd; padding: 16px; margin: 8px 0; border-radius: 8px;">
			<h3 style="color: #e74c3c; margin: 0 0 8px 0;">
				${discount.code} - ${
				discount.discountType === 'percentage'
					? discount.discountValue + '%'
					: discount.discountValue.toLocaleString() + 'đ'
			} OFF
			</h3>
			<p style="margin: 4px 0; color: #666;">
				${discount.description || 'Áp dụng cho đơn hàng của bạn'}
			</p>
			<p style="margin: 4px 0; font-size: 12px; color: #999;">
				Hết hạn: ${new Date(discount.endDate).toLocaleDateString('vi-VN')}
			</p>
		</div>
	`
		)
		.join('');

	return `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
			<h1 style="color: #2c3e50; text-align: center;">🎉 Ưu đãi tuần mới!</h1>
			<p>Xin chào <strong>${userName || 'Khách hàng'}</strong>,</p>
			<p>Chúng tôi có những ưu đãi hấp dẫn dành riêng cho bạn tuần này:</p>
			${discountList}
			<div style="text-align: center; margin: 24px 0;">
				<a href="${process.env.FRONTEND_URL}/discounts" 
				   style="background-color: #e74c3c; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
					Mua sắm ngay
				</a>
			</div>
			<p style="color: #666; font-size: 14px;">
				Cảm ơn bạn đã tin tưởng và đồng hành cùng chúng tôi!
			</p>
		</div>
	`;
};

/**
 * Helper function - Template email sinh nhật
 */
const generateBirthdayEmailTemplate = (userName, discountCode) => {
	return `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px;">
			<div style="text-align: center;">
				<h1 style="color: white; font-size: 32px;">🎂 Chúc mừng sinh nhật!</h1>
				<p style="font-size: 18px;">Chúc <strong>${userName}</strong> một ngày sinh nhật thật vui vẻ và hạnh phúc!</p>
			</div>
			
			<div style="background: white; padding: 24px; margin: 24px 0; border-radius: 12px; color: #333;">
				<h2 style="color: #e74c3c; text-align: center; margin: 0 0 16px 0;">🎁 Quà tặng đặc biệt</h2>
				<div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px dashed #e74c3c;">
					<h3 style="color: #e74c3c; margin: 0 0 8px 0; font-size: 24px;">${discountCode}</h3>
					<p style="margin: 0; font-size: 18px; font-weight: bold; color: #2c3e50;">GIẢM 20% toàn bộ đơn hàng</p>
					<p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">Có hiệu lực trong 7 ngày</p>
				</div>
			</div>

			<div style="text-align: center;">
				<a href="${process.env.FRONTEND_URL}?discount=${discountCode}" 
				   style="background-color: #e74c3c; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
					Sử dụng ngay
				</a>
			</div>

			<p style="text-align: center; margin: 24px 0 0 0; opacity: 0.9;">
				Một lần nữa, chúc bạn sinh nhật vui vẻ! 🎉
			</p>
		</div>
	`;
};

/**
 * Helper function - Template email nhắc nhở discount hết hạn
 */
const generateExpiryReminderEmailTemplate = (userName, expiringDiscounts) => {
	const discountList = expiringDiscounts
		.map(
			(discount) => `
		<tr style="border-bottom: 1px solid #eee;">
			<td style="padding: 12px; font-weight: bold; color: #e74c3c;">${
				discount.code
			}</td>
			<td style="padding: 12px;">${
				discount.discountType === 'percentage'
					? discount.discountValue + '%'
					: discount.discountValue.toLocaleString() + 'đ'
			} OFF</td>
			<td style="padding: 12px; color: #e74c3c; font-weight: bold;">${new Date(
				discount.endDate
			).toLocaleDateString('vi-VN')}</td>
		</tr>
	`
		)
		.join('');

	return `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
			<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
				<h1 style="color: #856404; margin: 0; text-align: center;">⏰ Ưu đãi sắp hết hạn!</h1>
			</div>
			
			<p>Xin chào <strong>${userName || 'Khách hàng'}</strong>,</p>
			<p>Các ưu đãi sau sẽ <strong style="color: #e74c3c;">hết hạn trong 24 giờ tới</strong>. Đừng bỏ lỡ cơ hội tiết kiệm này!</p>
			
			<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
				<thead>
					<tr style="background: #e74c3c; color: white;">
						<th style="padding: 12px; text-align: left;">Mã giảm giá</th>
						<th style="padding: 12px; text-align: left;">Giá trị</th>
						<th style="padding: 12px; text-align: left;">Hết hạn</th>
					</tr>
				</thead>
				<tbody>
					${discountList}
				</tbody>
			</table>

			<div style="text-align: center; margin: 24px 0;">
				<a href="${process.env.FRONTEND_URL}/shop" 
				   style="background-color: #e74c3c; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
					Mua sắm ngay
				</a>
			</div>

			<p style="color: #666; font-size: 14px; text-align: center;">
				Nhanh tay kẻo lỡ! Các ưu đãi này chỉ có trong thời gian ngắn.
			</p>
		</div>
	`;
};

/**
 * Khởi động tất cả notification jobs
 */
export const startNotificationJobs = () => {
	console.log('Starting notification jobs...');

	cleanupExpiredNotificationsJob();
	abandonedCartReminderJob();
	weeklyDiscountNotificationJob();
	birthdayDiscountJob();
	discountExpiryReminderJob();

	console.log('All notification jobs started successfully.');
};

export default {
	startNotificationJobs,
	cleanupExpiredNotificationsJob,
	abandonedCartReminderJob,
	weeklyDiscountNotificationJob,
	birthdayDiscountJob,
	discountExpiryReminderJob,
};
