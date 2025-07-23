import { formatFail, formatError } from '../response/responseFormatter.js';
import AppError from './AppError.js';

export const globalErrorHandler = (err, req, res, next) => {
	// Lỗi do người dùng, có thể xử lý được
	if (err instanceof AppError) {
		return formatFail({
			res,
			message: err.message,
			code: err.statusCode,
			errors: err.errors,
			errorCode: err.errorCode,
		});
	}

	// Lỗi hệ thống không mong đợi
	console.error('🔥 SYSTEM ERROR:', err);

	return formatError({
		res,
		message: 'Internal Server Error',
		code: 500,
	});
};
