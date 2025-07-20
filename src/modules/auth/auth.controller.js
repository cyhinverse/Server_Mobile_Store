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
		const { phoneNumber, password } = req.body;
		console.log(phoneNumber, password);

		if (!phoneNumber || !password) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Phone number and password are required',
			});
		}

		const { error } = AuthValidation.loginValidation.validate({
			phoneNumber,
			password,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		const user = await UserService.checkUserExists(phoneNumber);
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
			role: user.roles,
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
				message: 'Failed to send reset email',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Password reset email sent successfully',
		});
	});
	resetPassword = catchAsync(async (req, res) => {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Token and new password are required',
			});
		}

		const { error } = AuthValidation.resetPasswordValidation.validate({
			token,
			newPassword,
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
		user.password = hashedPassword;
		const updatedUser = await user.save();
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
	verifyEmail = catchAsync(async (req, res) => {
		const { token } = req.query;
		if (!token) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Token is required',
			});
		}
		const decoded = await authService.verifyEmailToken(token);
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
		if (user.verifyEmail) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Email already verified',
			});
		}
		user.verifyEmail = true;
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
		const { userId, role } = req.body;

		// Validate input
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

		// Cập nhật role cho user
		const updatedUser = await UserService.updateUser(userId, {
			$addToSet: { roles: role },
		});

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
		const { role } = req.params;

		// Kiểm tra role hợp lệ
		const validRoles = ['user', 'admin'];
		if (!validRoles.includes(role)) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
			});
		}

		const users = await UserService.getUsersByRole(role);

		res.status(StatusCodes.OK).json({
			message: `Get users with role ${role} successfully`,
			data: users,
		});
	});
	assignPermissions = catchAsync(async (req, res) => {
		const { error } = PermissionValidation.assignPermissions.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		const { userId, permissions } = req.body;

		const updatedUser = await UserService.assignPermissions(
			userId,
			permissions
		);

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

		const updatedUser = await UserService.revokePermissions(
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
