import { catchAsync } from '../../configs/catchAsync.js';
import AuthValidation from './auth.validation.js';
import { StatusCodes } from 'http-status-codes';
import GoogleStrategy from 'passport-google-oauth20';
GoogleStrategy.Strategy;
import jwt from 'jsonwebtoken';
import authService from './auth.service.js';
import { transporter } from '../../configs/config.nodemailer.js';
import User from '../user/user.model.js';
import { generateRandomCode } from '../../utils/generateRandomCode.js';
import dotenv from 'dotenv';
import AuthService from './auth.service.js';
import { Token } from '../../utils/token.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';
import BaseController from '../../core/controller/base.controller.js';
import { hashPassword, comparePassword } from '../../utils/password.util.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
dotenv.config();

class AuthController extends BaseController {
	constructor() {
		super(AuthService);
		if (!AuthService) {
			throw new Error('AuthService is required');
		}
		if (!AuthController.instance) return AuthController.instance;
		AuthController.instance = this;
	}
	register = catchAsync(async (req, res) => {
		const { fullName, dayOfBirth, phoneNumber, email, password } = req.body;
		if (!fullName || !dayOfBirth || !phoneNumber || !email || !password) {
			return formatFail({
				res,
				message: 'All fields are required',
				code: StatusCodes.BAD_REQUEST,
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
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const userExists = await AuthService.checkUserExists(email);
		if (userExists) {
			return formatFail({
				res,
				message: 'User already exists',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const hashedPassword = await hashPassword(password);
		if (!hashedPassword) {
			return formatFail({
				res,
				message: 'Failed to hash password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		const userData = {
			fullName,
			dayOfBirth,
			phoneNumber,
			email,
			password: hashedPassword,
		};

		const newUser = await AuthService.create(userData);

		if (!newUser) {
			return formatError({
				res,
				message: 'Failed to create user',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		const { password: _, ...userWithoutPassword } = newUser.toObject();
		if (!userWithoutPassword) {
			return formatFail({
				res,
				message: 'Failed to create user without password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return formatSuccess({
			res,
			data: userWithoutPassword,
			message: 'User registered successfully',
			code: StatusCodes.CREATED,
		});
	});
	login = catchAsync(async (req, res) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return formatFail({
				res,
				message: 'Email and password are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const { error } = AuthValidation.loginValidation.validate({
			email,
			password,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const user = await AuthService.checkUserExists(email);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return formatFail({
				res,
				message: 'Invalid email or password',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		const payload = {
			_id: user._id,
			email: user.email,
			name: user.fullName,
			roles: user.roles,
			permissions: user.permissions,
		};

		const accessToken = Token.generateAccessToken(payload);
		const refreshToken = Token.generateRefreshToken(payload);

		if (!accessToken || !refreshToken) {
			return formatError({
				res,
				message: 'Failed to generate tokens',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
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
			sameSite: 'strict',
			path: '/',
			maxAge: 60 * 60 * 1000,
		});

		return formatSuccess({
			res,
			data: {
				id: user._id,
				fullName: user.fullName,
				email: user.email,
				roles: user.roles,
				permissions: user.permissions,
			},
			meta: {
				accessToken,
				refreshToken,
			},
			message: 'Login successful',
			code: StatusCodes.OK,
		});
	});
	loginWithGoogle = catchAsync(async (req, res) => {
		const user = req.user;

		if (!user) {
			return formatFail({
				res,
				message: 'Google authentication failed',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		const token = jwt.sign(
			{ id: user._id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		);

		return formatSuccess({
			res,
			data: {
				id: user._id,
				fullName: user.fullName,
				email: user.email,
				roles: user.roles,
				permissions: user.permissions,
			},
			token,
			message: 'Login with Google successful',
		});
	});
	forgotPassword = catchAsync(async (req, res) => {
		const { email } = req.body;
		if (!email) {
			return formatFail({
				res,
				message: 'Email is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const { error } = AuthValidation.forgotPasswordValidation.validate({
			email,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const user = await AuthService.checkUserExists(email);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		const payload = {
			id: user._id,
			fullName: user.fullName,
			email: user.email,
			role: user.roles,
		};
		const resetToken = await Token.generateResetToken(payload);
		if (!resetToken || resetToken === null) {
			return formatError({
				res,
				message: 'Failed to generate reset token',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
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
							<a href="${process.env.CLIENT_URL}/Auth/Reset-Password?token=${resetToken}" 
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
		if (!info || info.rejected.length > 0) {
			return formatError({
				res,
				message: 'Failed to send reset email',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			message: 'Password reset email sent successfully',
			code: StatusCodes.OK,
		});
	});
	resetPassword = catchAsync(async (req, res) => {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return formatFail({
				res,
				message: 'Token and new password are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const { error } = AuthValidation.resetPasswordValidation.validate({
			token,
			newPassword,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const decoded = await Token.verifyResetToken(token);
		if (!decoded) {
			return formatFail({
				res,
				message: 'Invalid or expired token',
				code: StatusCodes.UNAUTHORIZED,
			});
		}
		const user = await AuthService.findById(decoded.id);
		if (!user || user === null) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		const hashedPassword = await AuthService.hashPassword(newPassword);
		if (!hashedPassword) {
			return formatError({
				res,
				message: 'Failed to hash new password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		const updatedUser = await AuthService.updatePasswordForUser(
			user._id,
			hashedPassword
		);
		if (!updatedUser) {
			return formatError({
				res,
				message: 'Failed to update password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			message: 'Password reset successfully',
			code: StatusCodes.OK,
		});
	});
	logout = catchAsync(async (req, res) => {
		res.clearCookie('refreshToken');
		res.clearCookie('accessToken');
		return formatSuccess({
			res,
			message: 'Logout successful',
			code: StatusCodes.OK,
		});
	});
	sendCodeToVerifyEmail = catchAsync(async (req, res) => {
		const { email } = req.body;

		if (!email) {
			return formatFail({
				res,
				message: 'Email is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const { error } = AuthValidation.sendCodeToVerifyEmailValidation.validate({
			email,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		// Check if user exists
		const user = await AuthService.checkUserExists(email);

		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		// Check if email is already verified
		if (user.verifyEmail) {
			return formatFail({
				res,
				message: 'Email is already verified',
				code: StatusCodes.BAD_REQUEST,
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
		if (!infoEmail || infoEmail.rejected.length > 0) {
			return formatError({
				res,
				message: 'Failed to send verification email',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			message: 'Verification code sent successfully',
			code: StatusCodes.OK,
		});
	});
	verifyEmail = catchAsync(async (req, res) => {
		const { code } = req.body;
		if (!code) {
			return formatFail({
				res,
				message: 'Code is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const verify = await authService.verifyEmailCode(code);
		console.log(`verify`, verify);
		if (!verify) {
			return formatFail({
				res,
				message: 'Invalid or expired code',
				code: StatusCodes.UNAUTHORIZED,
			});
		}
		const user = await AuthService.findById(verify._id);
		if (!user || user === null) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		if (user.verifyEmail) {
			return formatFail({
				res,
				message: 'Email already verified',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		user.verifyEmail = true;
		user.codeVerify = '';
		user.codeVerifyExpires = null;
		const updatedUser = await user.save();
		if (!updatedUser) {
			return formatError({
				res,
				message: 'Failed to verify email',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			message: 'Email verified successfully',
			code: StatusCodes.OK,
		});
	});
	changePassword = catchAsync(async (req, res) => {
		const { oldPassword, newPassword } = req.body;
		const userId = req.user?.id;

		if (!oldPassword || !newPassword) {
			return formatFail({
				res,
				message: 'Old password and new password are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		if (!userId) {
			return formatFail({
				res,
				message: 'User not authenticated',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		const { error } = AuthValidation.changePasswordValidation.validate({
			oldPassword,
			newPassword,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const user = await AuthService.findById(userId);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		const isPasswordValid = await AuthService.checkComparePassword(
			oldPassword,
			user.password
		);
		if (!isPasswordValid) {
			return formatFail({
				res,
				message: 'Invalid old password',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		const hashedPassword = await AuthService.hashPassword(newPassword);
		if (!hashedPassword) {
			return formatError({
				res,
				message: 'Failed to hash new password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		user.password = hashedPassword;
		const updatedUser = await user.save();
		if (!updatedUser) {
			return formatError({
				res,
				message: 'Failed to update password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return formatSuccess({
			res,
			message: 'Password changed successfully',
			code: StatusCodes.OK,
		});
	});
	getAllRoles = catchAsync(async (req, res) => {
		const rolesSchema = User.schema.paths.roles;
		const rolesEnum = rolesSchema?.enumValues ||
			rolesSchema?.options?.enum || ['user', 'admin'];

		return formatSuccess({
			res,
			data: rolesEnum,
			message: 'Get all roles successfully',
			code: StatusCodes.OK,
		});
	});
	assignRoleToUser = catchAsync(async (req, res) => {
		const { userId } = req.params;
		const { role } = req.body;

		if (!userId || !role) {
			return formatFail({
				res,
				message: 'User ID and role are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		// Kiểm tra role hợp lệ
		const validRoles = ['user', 'admin'];
		if (!validRoles.includes(role)) {
			return formatFail({
				res,
				message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedUser = await AuthService.updateRoleForUser(userId, role);

		if (!updatedUser) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			data: {
				id: updatedUser._id,
				roles: updatedUser.roles,
			},
			message: 'Role assigned successfully',
			code: StatusCodes.OK,
		});
	});
	revokeRoleFromUser = catchAsync(async (req, res) => {
		const { userId, role } = req.body;
		if (!userId || !role) {
			return formatFail({
				res,
				message: 'User ID and role are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const updatedUser = await AuthService.updateUser(userId, {
			$pull: { roles: role },
		});

		if (!updatedUser) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			data: {
				id: updatedUser._id,
				roles: updatedUser.roles,
			},
			message: 'Role revoked successfully',
			code: StatusCodes.OK,
		});
	});
	getUsersByRole = catchAsync(async (req, res) => {
		const { role } = req.query;

		const validRoles = ['user', 'admin'];
		if (!validRoles.includes(role)) {
			return formatFail({
				res,
				message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const users = await AuthService.getUsersByRole(role);

		return formatSuccess({
			res,
			data: users,
			message: `Get users with role ${role} successfully`,
			code: StatusCodes.OK,
		});
	});
	assignPermissions = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { permissions } = req.body;
		if (!id || !permissions) {
			return formatFail({
				res,
				message: 'User ID and permissions are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedUser = await AuthService.assignPermissions(id, permissions);

		if (!updatedUser) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			data: {
				id: updatedUser._id,
				permissions: updatedUser.permissions,
			},
			message: 'Permissions assigned successfully',
			code: StatusCodes.OK,
		});
	});
	revokePermissions = catchAsync(async (req, res) => {
		const { userId, permissions } = req.body;

		if (!userId || !permissions) {
			return formatFail({
				res,
				message: 'User ID and permissions are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedUser = await AuthService.revokePermissions(
			userId,
			permissions
		);

		if (!updatedUser) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			data: {
				id: updatedUser._id,
				permissions: updatedUser.permissions,
			},
			message: 'Permissions revoked successfully',
			code: StatusCodes.OK,
		});
	});
	getUserPermissions = catchAsync(async (req, res) => {
		const { userId } = req.params;

		const user = await AuthService.findById(userId);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			data: user.permissions,
			message: 'Get user permissions successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Resend verification code
	 */
	resendVerificationCode = catchAsync(async (req, res) => {
		const userId = req.user?.id;

		if (!userId) {
			return formatFail({
				res,
				message: 'User not authenticated',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		const user = await AuthService.findById(userId);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		if (user.verifyEmail) {
			return formatFail({
				res,
				message: 'Email already verified',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		// Generate new code
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

		await AuthService.updateUser(userId, {
			codeVerify: code,
			codeExpiresAt: expiresAt,
		});

		// TODO: Send email with code using nodemailer
		// await sendVerificationEmail(user.email, code);

		return formatSuccess({
			res,
			data: { expiresAt },
			message: 'Verification code sent successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Generate QR code for 2FA
	 */
	generateQRCode = catchAsync(async (req, res) => {
		const userId = req.user?.id;

		if (!userId) {
			return formatFail({
				res,
				message: 'User not authenticated',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		const user = await AuthService.findById(userId);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		// Generate TOTP secret using speakeasy
		const secret = speakeasy.generateSecret({
			name: `Mobile Store (${user.email})`,
			issuer: 'Mobile Store',
			length: 32,
		});

		// Generate QR code data URL
		const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

		// Save secret to database
		await AuthService.updateUser(userId, {
			qr_code: secret.base32,
			qrExpiresAt: null, // No expiry for TOTP secret
		});

		return formatSuccess({
			res,
			data: {
				qr_code: qrCodeDataURL, // Return QR code as data URL image
				secret: secret.base32, // Return secret for manual entry
				otpauth_url: secret.otpauth_url,
			},
			message: 'QR code generated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Verify QR code for 2FA
	 */
	verifyQRCode = catchAsync(async (req, res) => {
		const userId = req.user?.id;
		const { code: token } = req.body;

		if (!userId) {
			return formatFail({
				res,
				message: 'User not authenticated',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		if (!token) {
			return formatFail({
				res,
				message: 'Verification code is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await AuthService.findById(userId);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		if (!user.qr_code) {
			return formatFail({
				res,
				message: 'No 2FA secret found. Please generate QR code first.',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		// Verify TOTP token using speakeasy
		const verified = speakeasy.totp.verify({
			secret: user.qr_code,
			encoding: 'base32',
			token: token,
			window: 2, // Allow 2 time steps before and after
		});

		if (!verified) {
			return formatFail({
				res,
				message: 'Invalid verification code',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		// Enable 2FA for user and keep the secret
		await AuthService.updateUser(userId, {
			twoFactorEnabled: true, // Enable 2FA
			// Keep qr_code for future verifications
		});

		return formatSuccess({
			res,
			data: { verified: true, twoFactorEnabled: true },
			message: 'QR code verified successfully. 2FA is now enabled.',
			code: StatusCodes.OK,
		});
	});
}

export default new AuthController();
