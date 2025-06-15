import chalk from "chalk";
import { catchAsync } from "../configs/catchAsync.js";
import { registerValidation } from "../validations/user.validation.js";
import { StatusCodes } from "http-status-codes";
import UserService from "../services/user.service.js";
import GoogleStrategy from "passport-google-oauth20";
GoogleStrategy.Strategy
import jwt from "jsonwebtoken";



class UserController {
    register = catchAsync(async (req, res) => {
        const { fullName, dayOfBirth, phoneNumber, email, password, address } = req.body;
        if (!fullName || !dayOfBirth || !phoneNumber || !email || !password || !address) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: chalk.red("All fields are required")
            });
        }

        const { error } = registerValidation.validate({
            fullName,
            dayOfBirth,
            phoneNumber,
            email,
            password,
            address
        });
        if (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: chalk.red(error.details[0].message)
            })
        }
        const userExists = await UserService.checkUserExists(email);
        if (userExists) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: chalk.red("User already exists")
            });
        }
        const hashedPassword = await UserService.hashPassword(password);
        if (!hashedPassword) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: chalk.red("Failed to hash password")
            });
        }
        const userData = {
            fullName,
            dayOfBirth,
            phoneNumber,
            email,
            password: hashedPassword,
            address
        }

        const newUser = await UserService.createUser(userData);

        if (!newUser) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: chalk.red("Failed to create user")
            });
        }

        const { password: _, ...userWithoutPassword } = newUser.toObject();
        if (!userWithoutPassword) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: chalk.red("Failed to create user")
            });
        }
        return res.status(StatusCodes.CREATED).json({
            message: chalk.green("User created successfully"),
            user: userWithoutPassword
        });

    })
    login = catchAsync(async (req, res) => {

    })
    loginWithGoogle = catchAsync(async (req, res) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Google authentication failed' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(StatusCodes.OK).json({
            message: chalk.green("Login successful"),
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
            token
        });

    })
}


export default new UserController();