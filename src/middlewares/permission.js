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

		// Admin bypass - admin có thể truy cập tất cả
		const userRoles = user.roles || user.role || [];
		const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
		
		if (rolesArray.includes('admin')) {
			return next();
		}

		// Convert to array if single value
		const required = Array.isArray(requiredRolesOrPermissions)
			? requiredRolesOrPermissions
			: [requiredRolesOrPermissions];

		// Check if user has required role
		const hasRole = required.some(req => rolesArray.includes(req));
		if (hasRole) {
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
