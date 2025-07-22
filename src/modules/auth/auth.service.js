import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';
import dotenv from 'dotenv';
dotenv.config();
class AuthService {
	static async generateRefreshToken(payload) {
		return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: '15d',
		});
	}
	static async generateAccessToken(payload) {
		return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '1h',
		});
	}
	static async generateResetToken(payload) {
		return jwt.sign(payload, process.env.RESET_TOKEN_SECRET, {
			expiresIn: '15m',
		});
	}
	static async verifyResetToken(token) {
		try {
			return jwt.verify(token, process.env.RESET_TOKEN_SECRET);
		} catch (error) {
			throw new Error('Invalid or expired reset token');
		}
	}
	static async verifyRefreshToken(token) {
		if (!token) {
			throw new Error('Refresh token is required');
		}
		try {
			return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
		} catch (error) {
			throw new Error('Invalid or expired refresh token');
		}
	}
	static async verifyEmailCode(code) {
		if (!code) {
			throw new Error('Email verification code is required');
		}
		const user = await User.findOne({ codeVerify: code });
		if (!user) {
			throw new Error('Invalid or expired email verification code');
		}
		if (user.codeVerifyExpires < Date.now()) {
			throw new Error('Email verification code has expired');
		}
		return user;
	}
	static async updateUser(userId, updateData) {
		return await User.findByIdAndUpdate(userId, updateData, { new: true });
	}

	static async getUsersByRole(role) {
		return await User.find({ roles: role }).select('-password -__v');
	}
	static async assignPermissions(id, permissions) {
		return await User.findByIdAndUpdate(
			id,
			{ $addToSet: { permissions: permissions } },
			{ new: true }
		);
	}

	static async revokePermissions(userId, permissions) {
		return await User.findByIdAndUpdate(
			userId,
			{ $pull: { permissions: permissions } },
			{ new: true }
		);
	}

	static async getUserWithPermissions(userId) {
		return await User.findById(userId).select('permissions roles');
	}
	static async updateRoleForUser(userId, role) {
		return await User.findByIdAndUpdate(
			userId,
			{ $set: { roles: role } },
			{ new: true }
		);
	}
}

export default AuthService;
