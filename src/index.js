// Import required libraries
import express from 'express';
import dotenv from 'dotenv'; // Environment variables management
import cors from 'cors'; // Cross-Origin Resource Sharing handling
import connectDB from './db/connect.mongodb.js'; // MongoDB connection
import { configCors } from './configs/config.cors.js'; // CORS configuration
import routes from './routes/index.js'; // API routing
import helmet from 'helmet'; // HTTP headers security middleware
import morgan from 'morgan'; // HTTP request logger
import compression from 'compression'; // Response compression
import cookieParser from 'cookie-parser'; // Cookie parser
import { initSocketIo } from './sockets/index.js'; // WebSocket for real-time
import { startNotificationJobs } from './jobs/notification.job.js'; // Notification jobs
import http from 'http'; // HTTP server
// Load environment variables from .env file
dotenv.config();

// Initialize Express app and basic configuration
const app = express();
const PORT = process.env.PORT || 3000; // Server port, default 3000
const server = http.createServer(app); // Create HTTP server for Socket.IO
// Configure middleware
app.use(cors(configCors)); // Allow access from different domains
app.use(cookieParser()); // Parse cookies from request
app.use(express.json()); // Parse JSON request body
app.use(morgan('combined')); // Log HTTP requests with detailed format
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
// Security configuration with Helmet
app.use(
	helmet({
		contentSecurityPolicy: true, // Protect against XSS attacks
		xssFilter: true, // Filter XSS
		frameguard: {
			action: 'deny', // Prevent clickjacking attacks
		},
		hidePoweredBy: true, // Hide X-Powered-By header
		noSniff: true, // Prevent MIME type sniffing
	})
);
// Compress response to reduce bandwidth
app.use(compression());

// Register API routes
routes(app);

// Connect to MongoDB database
connectDB(app);

// Initialize Socket.IO for real-time communication
const io = initSocketIo(server);

// Start notification jobs
startNotificationJobs();

// Start server
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// Export Socket.IO instance for use in other modules
export { io };
