import jwt from "jsonwebtoken"

class AuthService {
    static async generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '15d'
        });
    }
    static async generateAccessToken(payload) {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'
        });
    }
    static async generateResetToken(payload) {
        return jwt.sign(payload, process.env.RESET_TOKEN_SECRET, {
            expiresIn: '15m'
        });
    }
}

export default AuthService;