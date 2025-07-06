import chalk from 'chalk';
import { catchAsync } from '../../configs/catchAsync.js';
import AuthValidation from './auth.validation.js';
import { StatusCodes } from 'http-status-codes';
import UserService from '../user/user.service.js';
import GoogleStrategy from 'passport-google-oauth20';
GoogleStrategy.Strategy;
import jwt from 'jsonwebtoken';
import authService from './auth.service.js';
import { transporter } from '../../configs/config.nodemailer.js';

class AuthController {
	register = catchAsync(async (req, res) => {
		const { fullName, dayOfBirth, phoneNumber, email, password, address } =
			req.body;
		if (
			!fullName ||
			!dayOfBirth ||
			!phoneNumber ||
			!email ||
			!password ||
			!address
		) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('All fields are required'),
			});
		}

		const { error } = AuthValidation.registerValidation.validate({
			fullName,
			dayOfBirth,
			phoneNumber,
			email,
			password,
			address,
		});
		if (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red(error.details[0].message),
			});
		}
		const userExists = await UserService.checkUserExists(email);
		if (userExists) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('User already exists'),
			});
		}
		const hashedPassword = await UserService.hashPassword(password);
		if (!hashedPassword) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to hash password'),
			});
		}
		const userData = {
			fullName,
			dayOfBirth,
			phoneNumber,
			email,
			password: hashedPassword,
			address,
		};

		const newUser = await UserService.createUser(userData);

		if (!newUser) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to create user'),
			});
		}

		const { password: _, ...userWithoutPassword } = newUser.toObject();
		if (!userWithoutPassword) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to create user'),
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: chalk.green('User created successfully'),
			user: userWithoutPassword,
		});
	});
	login = catchAsync(async (req, res) => {
		const { phoneNumber, password } = req.body;
		console.log(phoneNumber, password);

		if (!phoneNumber || !password) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Phone number and password are required'),
			});
		}

		const { error } = AuthValidation.loginValidation.validate({
			phoneNumber,
			password,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
			});
		}

		const user = await UserService.checkUserExists(phoneNumber);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('User not found'),
			});
		}
		const isPasswordValid = await UserService.comparePassword(
			password,
			user.password
		);
		if (!isPasswordValid) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: chalk.red('Invalid password'),
			});
		}

		const payload = {
			id: user._id,
			email: user.email,
			name: user.fullName,
			role: user.roles,
		};

		const accessToken = await authService.generateAccessToken(payload);
		const refreshToken = await authService.generateRefreshToken(payload);

		if (!accessToken || !refreshToken) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to generate tokens'),
			});
		}

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 15 * 24 * 60 * 60 * 1000,
		});
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 1000,
		});
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Login successful'),
			user: {
				id: user._id,
				fullName: user.fullName,
				email: user.email,
				phoneNumber: user.phoneNumber,
				address: user.address,
			},
			accessToken,
			refreshToken,
		});
	});
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
			message: chalk.green('Login successful'),
			user: {
				id: user._id,
				fullName: user.fullName,
				email: user.email,
			},
			token,
		});
	});
	forgotPassword = catchAsync(async (req, res) => {
		const { email } = req.body;
		if (!email) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Email is required'),
			});
		}
		const { error } = AuthValidation.forgotPasswordValidation.validate({
			email,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
			});
		}
		const user = await UserService.checkUserExists(email);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('User not found'),
			});
		}

		const payload = {
			id: user._id,
			fullName: user.fullName,
			email: user.email,
			role: user.roles,
		};
		const resetToken = await authService.generateResetToken(payload);
		if (!resetToken || resetToken === null) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to generate reset token'),
			});
		}

		const info = transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: 'Password Reset Request',
			text:
				`You requested a password reset. Please click the link below to reset your password:\n\n` +
				`${process.env.CLIENT_URL}/reset-password?token=${resetToken}\n\n` +
				`If you did not request this, please ignore this email.\n`,
			html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 32px 24px; background: #fafbfc;">
                    <h2 style="color: #2d3748;">Password Reset Request</h2>
                    <p style="color: #4a5568; font-size: 16px;">You requested a password reset. Please click the button below to reset your password:</p>
                    <a href="${
											process.env.CLIENT_URL
										}/reset-password?token=${resetToken}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #3182ce; color: #fff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Reset Password</a>
                    <p style="color: #a0aec0; font-size: 14px;">If you did not request this, please ignore this email.</p>
                    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; font-size: 12px;">&copy; ${new Date().getFullYear()} Mobile Store. All rights reserved.</p>
                </div>
            `,
		});
		if (!info || info.rejected.length > 0) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to send reset email'),
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Password reset email sent successfully'),
		});
	});
	resetPassword = catchAsync(async (req, res) => {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Token and new password are required'),
			});
		}

		const { error } = AuthValidation.resetPasswordValidation.validate({
			token,
			newPassword,
		});

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
			});
		}
		const decoded = await authService.verifyResetToken(token);
		if (!decoded) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: chalk.red('Invalid or expired token'),
			});
		}
		const user = await UserService.getUserById(decoded.id);
		if (!user || user === null) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('User not found'),
			});
		}
		const hashedPassword = await UserService.hashPassword(newPassword);
		if (!hashedPassword) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to hash new password'),
			});
		}
		user.password = hashedPassword;
		const updatedUser = await user.save();
		if (!updatedUser) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to update password'),
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Password reset successfully'),
		});
	});
	logout = catchAsync(async (req, res) => {
		res.clearCookie('refreshToken');
		res.clearCookie('accessToken');
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Logout successful'),
		});
	});
}

export default new AuthController();
