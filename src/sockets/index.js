import { Server } from 'socket.io';
import { notificationSocket } from './notification.socket.js';

export const initSocketIo = (server) => {
	// Initialize Socket.IO with the provided server
	const io = new Server(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
			allowedHeaders: ['Content-Type'],
			credentials: true,
		},
	});
	// Handle socket connections
	io.on('connection', (socket) => {
		notificationSocket(io, socket);
		socket.on('disconnect', () => {
			console.log(`Socket ${socket.id} disconnected`);
		});
	});
	return io;
};
