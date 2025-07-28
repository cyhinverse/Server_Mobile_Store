import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../configs/catchAsync.js';

const authMiddleware = catchAsync(async (req, res, next) => {
	const token =
		req.cookies?.accessToken ||
		req.headers?.authorization?.replace('Bearer ', '');

	if (!token) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'No token provided',
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		// Gán payload vào req.user
		req.user = {
			_id: decoded._id || decoded.id, // chấp nhận cả id hoặc _id
			id: decoded._id || decoded.id, // thêm id property
			email: decoded.email,
			name: decoded.name,
			roles: decoded.roles,
			permissions: decoded.permissions,
		};

		next();
	} catch (error) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'Invalid or expired token',
		});
	}
});

export default authMiddleware;
