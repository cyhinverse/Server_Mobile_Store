
import joi from "joi"


const UserValidation = {
    createUserValidation: joi.object({
        fullName: joi.string().required().trim(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        roles: joi.array().items(joi.string()).required()
    })
}

export default UserValidation;