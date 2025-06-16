
import Joi from "joi"




const AuthValidation = {
    registerValidation: Joi.object({
        fullName: Joi.string().required().trim(),
        dayOfBirth: Joi.date().required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().required(),
        password: Joi.string().min(6).required(),
        address: Joi.string().required().trim()
    }),
    loginValidation: Joi.object({
        phoneNumber: Joi.string().required(),
        password: Joi.string().min(6).required()
    }),
    forgotPasswordValidation: Joi.object({
        email: Joi.string().email().required()
    }),
    resetPasswordValidation: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    }),
}


export default AuthValidation;