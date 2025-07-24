export const notificationSocket = (io, socket) => {
	socket.on('join', (userId) => {
		socket.join(userId);
		console.log(`User ${userId} joined the notification room`);
	});
};
