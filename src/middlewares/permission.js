import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../configs/catchAsync.js';

const checkPermission = (requiredRolesOrPermissions) => {
	return catchAsync(async (req, res, next) => {
		const user = req.user;

		if (!user) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Authentication required',
			});
		}

		// Convert to array if single value
		const required = Array.isArray(requiredRolesOrPermissions)
			? requiredRolesOrPermissions
			: [requiredRolesOrPermissions];

		// Check if user has required role
		const userRole = user.role || user.roles;
		if (required.includes(userRole)) {
			return next();
		}

		// Check if user has required permissions
		if (user.permissions && Array.isArray(user.permissions)) {
			const hasPermission = required.some((req) =>
				user.permissions.includes(req)
			);
			if (hasPermission) {
				return next();
			}
		}

		return res.status(StatusCodes.FORBIDDEN).json({
			message: `Access denied - Required role or permission: ${required.join(
				', '
			)}`,
		});
	});
};

export default checkPermission;
