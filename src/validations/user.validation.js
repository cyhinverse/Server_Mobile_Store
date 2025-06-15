
import Joi from "joi"

export const registerValidation = Joi.object({
    fullName: Joi.string().required().trim(),
    dayOfBirth: Joi.date().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(6).required(),
    address: Joi.string().required().trim()
}) 