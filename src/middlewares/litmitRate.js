import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';

export const litmitRate = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	skipSuccessfulRequests: true,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
			message: 'Too many requests, please try again later.',
			success: false,
		});
	},
});
