import Joi from 'joi';

const AuthValidation = {
	registerValidation: Joi.object({
		fullName: Joi.string().required().trim(),
		dayOfBirth: Joi.date().required(),
		email: Joi.string().email().required(),
		phoneNumber: Joi.string().required(),
		password: Joi.string().min(6).required(),
	}),
	loginValidation: Joi.object({
		phoneNumber: Joi.string().required(),
		password: Joi.string().min(6).required(),
	}),
	forgotPasswordValidation: Joi.object({
		email: Joi.string().email().required(),
	}),
	resetPasswordValidation: Joi.object({
		token: Joi.string().required(),
		password: Joi.string().min(6).required(),
		confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
	}),
	changePasswordValidation: Joi.object({
		oldPassword: Joi.string().min(6).required(),
		newPassword: Joi.string().min(6).required(),
		confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
	}),
	assignPermissions: Joi.object({
		userId: Joi.string().required(),
		permissions: Joi.array().items(Joi.string()).required(),
	}),
};

export default AuthValidation;
