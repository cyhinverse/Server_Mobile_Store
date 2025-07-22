import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../configs/catchAsync.js';

const authMiddleware = catchAsync(async (req, res, next) => {
	const token = req.cookies.accessToken;

	if (!token) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'No token provided',
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'Invalid or expired token',
		});
	}
});

export default authMiddleware;
