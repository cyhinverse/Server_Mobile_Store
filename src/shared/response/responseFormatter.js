import { RESPONSE_TYPE } from './responseTypes.js';

/**
 * Trả về response thành công
 * @param {object} res - Express response object
 * @param {object} data - Dữ liệu trả về
 * @param {string} message - Thông điệp
 * @param {number} code - HTTP status code
 * @param {object} meta - Thông tin phụ (pagination, version...)
 */
export const formatSuccess = (resOrOptions, message, data, code, meta) => {
	// Nếu tham số đầu tiên là object và có res property, dùng destructuring
	if (typeof resOrOptions === 'object' && resOrOptions.res) {
		const {
			res,
			data: dataParam = null,
			message: messageParam = 'Success',
			code: codeParam = 200,
			meta: metaParam = {},
		} = resOrOptions;
		
		return res.status(codeParam).json({
			status: RESPONSE_TYPE.SUCCESS,
			message: messageParam,
			data: dataParam,
			meta: metaParam,
		});
	}
	
	// Nếu không, sử dụng cách gọi truyền thống
	const res = resOrOptions;
	
	// Auto-detect nếu data và code bị đổi chỗ
	let actualMessage = message || 'Success';
	let actualData = data;
	let actualCode = code || 200;
	
	// Nếu data là number và code không phải number, có thể bị đổi chỗ
	if (typeof data === 'number' && typeof code !== 'number') {
		actualCode = data;
		actualData = code;
	}
	
	return res.status(actualCode).json({
		status: RESPONSE_TYPE.SUCCESS,
		message: actualMessage,
		data: actualData || null,
		meta: meta || {},
	});
};

/**
 * Trả về response lỗi do người dùng (logic, validation)
 */
export const formatFail = (resOrOptions, message, code, errors, errorCode) => {
	// Nếu tham số đầu tiên là object và có res property, dùng destructuring
	if (typeof resOrOptions === 'object' && resOrOptions.res) {
		const {
			res = null,
			message: messageParam = 'Bad Request',
			code: codeParam = 400,
			errors: errorsParam = [],
			errorCode: errorCodeParam = 'FAIL',
		} = resOrOptions;
		
		return res.status(codeParam).json({
			status: RESPONSE_TYPE.FAIL,
			message: messageParam,
			errorCode: errorCodeParam,
			errors: errorsParam,
		});
	}
	
	// Nếu không, sử dụng cách gọi truyền thống
	const res = resOrOptions;
	return res.status(code || 400).json({
		status: RESPONSE_TYPE.FAIL,
		message: message || 'Bad Request',
		errorCode: errorCode || 'FAIL',
		errors: errors || [],
	});
};

export const formatError = (resOrOptions, message, code) => {
	// Nếu tham số đầu tiên là object và có res property, dùng destructuring
	if (typeof resOrOptions === 'object' && resOrOptions.res) {
		const {
			res,
			message: messageParam = 'Internal Server Error',
			code: codeParam = 500,
		} = resOrOptions;
		
		return res.status(codeParam).json({
			status: RESPONSE_TYPE.ERROR,
			message: messageParam,
		});
	}
	
	// Nếu không, sử dụng cách gọi truyền thống
	const res = resOrOptions;
	return res.status(code || 500).json({
		status: RESPONSE_TYPE.ERROR,
		message: message || 'Internal Server Error',
	});
};
