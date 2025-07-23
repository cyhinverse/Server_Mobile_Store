import { RESPONSE_TYPE } from './responseTypes.js';

/**
 * Trả về response thành công
 * @param {object} res - Express response object
 * @param {object} data - Dữ liệu trả về
 * @param {string} message - Thông điệp
 * @param {number} code - HTTP status code
 * @param {object} meta - Thông tin phụ (pagination, version...)
 */
export const formatSuccess = ({
	res,
	data = null,
	message = 'Success',
	code = 200,
	meta = {},
}) => {
	return res.status(code).json({
		status: RESPONSE_TYPE.SUCCESS,
		message,
		data,
		meta,
	});
};

/**
 * Trả về response lỗi do người dùng (logic, validation)
 */
export const formatFail = ({
	res = null,
	message = 'Bad Request',
	code = 400,
	errors = [],
	errorCode = 'FAIL',
}) => {
	return res.status(code).json({
		status: RESPONSE_TYPE.FAIL,
		message,
		errorCode,
		errors,
	});
};

export const formatError = ({
	res,
	message = 'Internal Server Error',
	code = 500,
}) => {
	return res.status(code).json({
		status: RESPONSE_TYPE.ERROR,
		message,
	});
};
