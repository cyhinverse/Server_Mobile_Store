import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';
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
	static async verifyEmailToken(token) {
		if (!token) {
			throw new Error('Email verification token is required');
		}
		try {
			return jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
		} catch (error) {
			throw new Error('Invalid or expired email verification token');
		}
	}
	static async updateUser(userId, updateData) {
		return await User.findByIdAndUpdate(userId, updateData, { new: true });
	}

	static async getUsersByRole(role) {
		return await User.find({ roles: role }).select('-password -__v');
	}
	static async assignPermissions(userId, permissions) {
		return await User.findByIdAndUpdate(
			userId,
			{ $addToSet: { permissions: { $each: permissions } } },
			{ new: true }
		);
	}

	static async revokePermissions(userId, permissions) {
		return await User.findByIdAndUpdate(
			userId,
			{ $pull: { permissions: { $in: permissions } } },
			{ new: true }
		);
	}

	static async getUserWithPermissions(userId) {
		return await User.findById(userId).select('permissions roles');
	}
}

export default AuthService;
