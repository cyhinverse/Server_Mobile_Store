import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../configs/catchAsync.js';

export const checkPermission = (requiredPermission) => {
	return catchAsync(async (req, res, next) => {
		const user = req.user;

		// Admin có tất cả quyền
		if (user.roles.includes('admin')) {
			return next();
		}

		// Kiểm tra permission
		if (!user.permissions.includes(requiredPermission)) {
			return res.status(StatusCodes.FORBIDDEN).json({
				message: `Access denied - Required permission: ${requiredPermission}`,
			});
		}

		next();
	});
};
