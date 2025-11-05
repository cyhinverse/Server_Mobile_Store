import { formatError } from '../shared/response/responseFormatter.js';
import { StatusCodes } from 'http-status-codes';
export const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((error) => {
			console.error('CatchAsync Error:', error);
			formatError({
				res,
				message: error.message || 'An unexpected error occurred',
				code: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			});
		});
	};
};
