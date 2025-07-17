
export const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((error) => {
			console.log('Error occurred:', error);
			res.status(500).json('An unexpected error occurred.');
		});
	};
};
