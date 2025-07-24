/**
 * AppError class for handling application-specific errors.
 * Extends the built-in Error class to provide additional properties.
 * @extends {Error}
 * @param {string} message -- Type of error message
 * @param {number} statusCode -- HTTP status code for the error
 * @param {Array} [error=[]] -- Optional array of error details
 * @param {string} [errorCode='APP_ERROR'] -- Optional error code for categorization
 * @property {boolean} isOperational -- Indicates if the error is operational (true) or programming (false)
 */
class AppError extends Error {
	constructor(message, statusCode, error = [], errorCode = 'APP_ERROR') {
		super(message);
		this.statusCode = statusCode;
		this.error = error;
		this.errorCode = errorCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}
