import jwt from 'jsonwebtoken';

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
}

export default AuthService;
