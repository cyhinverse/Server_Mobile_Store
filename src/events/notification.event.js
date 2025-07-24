import { io } from '../index.js';

export const emitCreateNotification = async (userId, notificationData) => {
	try {
		if (!userId || !notificationData) {
			throw new Error('User ID and notification data are required');
		}

		io.to(userId.toString()).emit('notification:new', {
			_id: notificationData._id,
			type: notificationData.type,
			title: notificationData.title,
			content: notificationData.content,
			metadata: notificationData.metadata,
			priority: notificationData.priority,
			imageUrl: notificationData.imageUrl,
			scheduledAt: notificationData.scheduledAt,
		});
	} catch (error) {
		console.error('Error emitting notification:', error.message);
	}
};

export const emitUpdateNotification = async (userId, notificationData) => {
	try {
		if (!userId || !notificationData) {
			throw new Error('User ID and notification data are required');
		}

		io.to(userId).emit('notification:update', notificationData);
	} catch (error) {
		console.error('Error emitting notification update:', error.message);
	}
};

export const emitDeleteNotification = async (userId, notificationId) => {
	try {
		if (!userId || !notificationId) {
			throw new Error('User ID and notification ID are required');
		}

		io.to(userId).emit('notification:delete', { notificationId });
	} catch (error) {
		console.error('Error emitting notification deletion:', error.message);
	}
};

export const emitMarkAsRead = async (userId, notificationId) => {
	try {
		if (!userId || !notificationId) {
			throw new Error('User ID and notification ID are required');
		}

		io.to(userId).emit('notification:markAsRead', { notificationId });
	} catch (error) {
		console.error('Error emitting mark as read:', error.message);
	}
};
