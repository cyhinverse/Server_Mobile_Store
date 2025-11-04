export const notificationSocket = (io, socket) => {
	// Listen for 'join' event to join a specific room
	socket.on('join', (userId) => {
		socket.join(userId);
	});
};
