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
