
import { StatusCodes } from 'http-status-codes';

export const permisstion = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(StatusCodes.FORBIDDEN).json({
				message: 'You do not have permission to perform this action',
			});
		}
		next();
	};
};
