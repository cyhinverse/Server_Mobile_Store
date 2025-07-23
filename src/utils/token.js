export const Token = {
	generateRefreshToken: (payload) => {
		return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: '15d',
		});
	},
	generateAccessToken: (payload) => {
		return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '1h',
		});
	},
	generateResetToken: (payload) => {
		return jwt.sign(payload, process.env.RESET_TOKEN_SECRET, {
			expiresIn: '15m',
		});
	},
	verifyResetToken: (token) => {
		try {
			return jwt.verify(token, process.env.RESET_TOKEN_SECRET);
		} catch (error) {
			throw new Error('Invalid or expired reset token');
		}
	},
	verifyRefreshToken: (token) => {
		if (!token) {
			throw new Error('Refresh token is required');
		}
		try {
			return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
		} catch (error) {
			throw new Error('Invalid or expired refresh token');
		}
	},
};
