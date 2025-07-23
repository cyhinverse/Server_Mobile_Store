import { formatFail } from '../shared/response/responseFormatter.js';

export const validateData = (schema, source = 'body') => {
	return (req, res, next) => {
		let dataToValidate;

		switch (source) {
			case 'body':
				dataToValidate = req.body;
				break;
			case 'query':
				dataToValidate = req.query;
				break;
			case 'params':
				dataToValidate = req.params;
				break;
			default:
				dataToValidate = req.body;
		}

		const { error, value } = schema.validate(dataToValidate, {
			abortEarly: false,
			allowUnknown: true,
			stripUnknown: true,
		});

		if (error) {
			const errorMessage = error.details
				.map((detail) => detail.message)
				.join(', ');

			return formatFail(res, errorMessage, 400);
		}

		// Replace the original data with validated data
		switch (source) {
			case 'body':
				req.body = value;
				break;
			case 'query':
				req.query = value;
				break;
			case 'params':
				req.params = value;
				break;
		}

		next();
	};
};
