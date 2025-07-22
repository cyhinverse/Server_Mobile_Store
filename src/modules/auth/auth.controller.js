import { catchAsync } from '../../configs/catchAsync.js';
import AuthValidation from './auth.validation.js';
import { StatusCodes } from 'http-status-codes';
import UserService from '../user/user.service.js';
import GoogleStrategy from 'passport-google-oauth20';
GoogleStrategy.Strategy;
import jwt from 'jsonwebtoken';
import authService from './auth.service.js';
import { transporter } from '../../configs/config.nodemailer.js';
import User from '../user/user.model.js';
import { generateRandomCode } from '../../utils/generateRandomCode.js';
import dotenv from 'dotenv';
import AuthService from './auth.service.js';
dotenv.config();

class AuthController {
	register = catchAsync(async (req, res) => {
		const { fullName, dayOfBirth, phoneNumber, email, password } = req.body;
		if (!fullName || !dayOfBirth || !phoneNumber || !email || !password) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'All fields are required',
			});
		}

		const { error } = AuthValidation.registerValidation.validate({
			fullName,
			dayOfBirth,
			phoneNumber,
			email,
			password,
		});
		if (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error.details[0].message,
			});
		}
		const userExists = await UserService.checkUserExists(email);
		if (userExists) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User already exists',
			});
		}
		const hashedPassword = await UserService.hashPassword(password);
		if (!hashedPassword) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to hash password',
			});
		}
		const userData = {
			fullName,
			dayOfBirth,
			phoneNumber,
			email,
			password: hashedPassword,
		};

		const newUser = await UserService.createUser(userData);

		if (!newUser) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to create user',
			});
		}

		const { password: _, ...userWithoutPassword } = newUser.toObject();
		if (!userWithoutPassword) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to create user',
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'User created successfully',
			user: userWithoutPassword,
		});
	});
	login = catchAsync(async (req, res) => {
		const { email, password } = req.body;
		console.log(email, password);

		if (!email || !password) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Email and password are required',
			});
		}

		const { error } = AuthValidation.loginValidation.validate({
			email,
			password,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		const user = await UserService.checkUserExists(email);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}
		const isPasswordValid = await UserService.comparePassword(
			password,
			user.password
		);
		if (!isPasswordValid) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Invalid password',
			});
		}

		const payload = {
			id: user._id,
			email: user.email,
			name: user.fullName,
			roles: user.roles,
			permissions: user.permissions,
		};

		const accessToken = await authService.generateAccessToken(payload);
		const refreshToken = await authService.generateRefreshToken(payload);

		if (!accessToken || !refreshToken) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to generate tokens',
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
			message: 'Login successful',
			user: {
				id: user._id,
				fullName: user.fullName,
				email: user.email,
				phoneNumber: user.phoneNumber,
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
			message: 'Login successful',
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
				message: 'Email is required',
			});
		}
		const { error } = AuthValidation.forgotPasswordValidation.validate({
			email,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const user = await UserService.checkUserExists(email);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
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
				message: 'Failed to generate reset token',
			});
		}

		const info = await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: 'Password Reset Request',
			text:
				`You requested a password reset. Please click the link below to reset your password:\n\n` +
				`${process.env.CLIENT_URL}/reset-password?token=${resetToken}\n\n` +
				`If you did not request this, please ignore this email.\n`,
			html: `
				<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e4e8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
					<div style="background: #3182ce; padding: 24px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 24px;">Mobile Store</h1>
					</div>
					<div style="background: white; padding: 32px 24px;">
						<h2 style="color: #333; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
						<p style="color: #555; font-size: 16px; line-height: 1.5;">Hello,</p>
						<p style="color: #555; font-size: 16px; line-height: 1.5;">We received a request to reset your password. To proceed with resetting your password, please click the button below:</p>
						<div style="text-align: center; margin: 32px 0;">
							<a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" 
								 style="display: inline-block; padding: 12px 28px; background: #3182ce; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.3s;">Reset Password</a>
						</div>
						<p style="color: #555; font-size: 16px; line-height: 1.5;">If you didn't request a password reset, you can safely ignore this email. Your account security is important to us.</p>
						<p style="color: #555; font-size: 16px; line-height: 1.5;">This link will expire in 1 hour.</p>
					</div>
					<div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e1e4e8;">
						<p style="color: #777; font-size: 14px; margin: 0;">&copy; ${new Date().getFullYear()} Mobile Store. All rights reserved.</p>
					</div>
				</div>
			`,
		});
		console.log(`check info`, info);
		if (!info || info.rejected.length > 0) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to send reset email',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Password reset email sent successfully',
		});
	});
	resetPassword = catchAsync(async (req, res) => {
		const { token, newPassword, confirmPassword } = req.body;

		if (!token || !newPassword || !confirmPassword) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Token, new password, and confirm password are required',
			});
		}

		const { error } = AuthValidation.resetPasswordValidation.validate({
			token,
			newPassword,
			confirmPassword,
		});

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const decoded = await authService.verifyResetToken(token);
		if (!decoded) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Invalid or expired token',
			});
		}
		const user = await UserService.getUserById(decoded.id);
		if (!user || user === null) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}
		const hashedPassword = await UserService.hashPassword(newPassword);
		if (!hashedPassword) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to hash new password',
			});
		}
		const updatedUser = await UserService.updatePasswordForUser(
			user._id,
			hashedPassword
		);
		if (!updatedUser) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to update password',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Password reset successfully',
		});
	});
	logout = catchAsync(async (req, res) => {
		res.clearCookie('refreshToken');
		res.clearCookie('accessToken');
		return res.status(StatusCodes.OK).json({
			message: 'Logout successful',
		});
	});
	sendCodeToVerifyEmail = catchAsync(async (req, res) => {
		const { email } = req.body;

		if (!email) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: 'Email is required',
			});
		}

		// Validate email format
		const { error } = AuthValidation.sendCodeToVerifyEmailValidation.validate({
			email,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: error.details[0].message,
			});
		}

		// Check if user exists
		const user = await UserService.getUserByEmail(email);

		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: 'User not found',
			});
		}

		// Check if email is already verified
		if (user.verifyEmail) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: 'Email is already verified',
			});
		}

		const code = generateRandomCode(6);
		user.codeVerify = code;
		user.codeExpiresAt = new Date(
			Date.now() + (parseInt(process.env.CODE_EXPIRATION_TIME) || 3600000)
		);

		await user.save();
		const infoEmail = await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: 'Verify Your Email',
			text: `Your verification code is: ${code}. This code will expire in 1 hour.`,
			html: `
				<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e4e8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
					<div style="background: #3182ce; padding: 24px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 24px;">Mobile Store</h1>
					</div>
					<div style="background: white; padding: 32px 24px;">
						<h2 style="color: #333; margin-top: 0; font-size: 20px;">Email Verification Code</h2>
						<p style="color: #555; font-size: 16px; line-height: 1.5;">Hello,</p>
						<p style="color: #555; font-size: 16px; line-height: 1.5;">Your verification code is <strong>${code}</strong>. This code will expire in one hour.</p>
						<p style="color: #555; font-size: 16px; line-height: 1.5;">If you did not request this, please ignore this email.</p>
					</div>
					<div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e1e4e8;">
						<p style="color: #777; font-size: 14px; margin: 0;">&copy; ${new Date().getFullYear()} Mobile Store. All rights reserved.</p>
					</div>
				</div>
			`,
		});
		console.log(`check info`, infoEmail);
		if (!infoEmail || infoEmail.rejected.length > 0) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: 'Failed to send verification email',
			});
		}
		return res.status(StatusCodes.OK).json({
			success: true,
			message: 'Verification code sent successfully',
		});
	});
	verifyEmail = catchAsync(async (req, res) => {
		const { code } = req.body;
		console.log(`code`, code);
		if (!code) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Code is required',
			});
		}
		const verify = await authService.verifyEmailCode(code);
		console.log(`verify`, verify);
		if (!verify) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Invalid or expired code',
			});
		}
		const user = await UserService.getUserById(verify.id);
		if (!user || user === null) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}
		if (user.verifyEmail) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Email already verified',
			});
		}
		user.verifyEmail = true;
		user.codeVerify = '';
		user.codeVerifyExpires = null;
		const updatedUser = await user.save();
		if (!updatedUser) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to verify email',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Email verified successfully',
		});
	});
	changePassword = catchAsync(async (req, res) => {
		const { oldPassword, newPassword } = req.body;
		const userId = req.user?.id;

		if (!oldPassword || !newPassword) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Old password and new password are required',
			});
		}

		if (!userId) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'User not authenticated',
			});
		}

		const { error } = AuthValidation.changePasswordValidation.validate({
			oldPassword,
			newPassword,
		});

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		const user = await UserService.getUserById(userId);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}

		const isPasswordValid = await UserService.comparePassword(
			oldPassword,
			user.password
		);
		if (!isPasswordValid) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Invalid old password',
			});
		}

		const hashedPassword = await UserService.hashPassword(newPassword);
		if (!hashedPassword) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to hash new password',
			});
		}

		user.password = hashedPassword;
		const updatedUser = await user.save();
		if (!updatedUser) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to update password',
			});
		}

		return res.status(StatusCodes.OK).json({
			message: 'Password changed successfully',
		});
	});
	getAllRoles = catchAsync(async (req, res) => {
		const rolesEnum = User.schema.path('roles').caster.enumValues;

		res.status(StatusCodes.OK).json({
			message: 'Get all roles successfully',
			data: rolesEnum || ['user', 'admin'],
		});
	});
	assignRoleToUser = catchAsync(async (req, res) => {
		const { userId } = req.params;
		const { role } = req.body;

		if (!userId || !role) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID and role are required',
			});
		}

		// Kiểm tra role hợp lệ
		const validRoles = ['user', 'admin'];
		if (!validRoles.includes(role)) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
			});
		}

		const updatedUser = await AuthService.updateRoleForUser(userId, role);

		if (!updatedUser) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}

		res.status(StatusCodes.OK).json({
			message: 'Role assigned successfully',
			user: {
				id: updatedUser._id,
				roles: updatedUser.roles,
			},
		});
	});
	revokeRoleFromUser = catchAsync(async (req, res) => {
		const { userId, role } = req.body;
		if (!userId || !role) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID and role are required',
			});
		}
		const updatedUser = await UserService.updateUser(userId, {
			$pull: { roles: role },
		});

		if (!updatedUser) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}

		res.status(StatusCodes.OK).json({
			message: 'Role revoked successfully',
			user: {
				id: updatedUser._id,
				roles: updatedUser.roles,
			},
		});
	});
	getUsersByRole = catchAsync(async (req, res) => {
		const { role } = req.query;

		const validRoles = ['user', 'admin'];
		if (!validRoles.includes(role)) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
			});
		}

		const users = await AuthService.getUsersByRole(role);

		res.status(StatusCodes.OK).json({
			message: `Get users with role ${role} successfully`,
			data: users,
		});
	});
	assignPermissions = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { permissions } = req.body;
		console.log(`assignPermissions`, id, permissions);
		if (!id || !permissions) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID and permissions are required',
			});
		}

		const updatedUser = await AuthService.assignPermissions(id, permissions);

		if (!updatedUser) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}

		res.status(StatusCodes.OK).json({
			message: 'Permissions assigned successfully',
			user: {
				id: updatedUser._id,
				permissions: updatedUser.permissions,
			},
		});
	});
	revokePermissions = catchAsync(async (req, res) => {
		const { userId, permissions } = req.body;

		if (!userId || !permissions) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID and permissions are required',
			});
		}

		const updatedUser = await AuthService.revokePermissions(
			userId,
			permissions
		);

		if (!updatedUser) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}

		res.status(StatusCodes.OK).json({
			message: 'Permissions revoked successfully',
			user: {
				id: updatedUser._id,
				permissions: updatedUser.permissions,
			},
		});
	});
	getUserPermissions = catchAsync(async (req, res) => {
		const { userId } = req.params;

		const user = await UserService.getUserById(userId);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}

		res.status(StatusCodes.OK).json({
			message: 'Get user permissions successfully',
			permissions: user.permissions,
		});
	});
}

export default new AuthController();
