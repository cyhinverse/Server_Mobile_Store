import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../configs/catchAsync.js';

const checkPermission = (requiredPermission) => {
	return catchAsync(async (req, res, next) => {
		const user = req.user;

		// Admin có tất cả quyền
		if (user.role === 'admin' || user.roles === 'admin') {
			return next();
		}

		// Kiểm tra permission
		if (!user.permissions || !user.permissions.includes(requiredPermission)) {
			return res.status(StatusCodes.FORBIDDEN).json({
				message: `Access denied - Required permission: ${requiredPermission}`,
			});
		}

		next();
	});
};

export default checkPermission;
