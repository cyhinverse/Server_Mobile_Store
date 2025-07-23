import cron from 'node-cron';
import notificationService from '../modules/notification/notification.service.js';

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

				// Logic để tìm và gửi thông báo nhắc nhở giỏ hàng bỏ quên
				// Cần implement dựa trên Cart model của project

				console.log('Abandoned cart reminder job completed.');
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
 * Khởi động tất cả notification jobs
 */
export const startNotificationJobs = () => {
	console.log('Starting notification jobs...');

	cleanupExpiredNotificationsJob();
	abandonedCartReminderJob();

	console.log('Notification jobs started successfully.');
};

export default {
	startNotificationJobs,
	cleanupExpiredNotificationsJob,
	abandonedCartReminderJob,
};
