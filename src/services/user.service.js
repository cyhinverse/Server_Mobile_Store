import User from "../models/user.model.js";
import bcrypt from "bcrypt";



class UserService {
    static async checkUserExists(email) {
        if (!email) {
            throw new Error("Email is required to check user existence");
        }
        const userExists = await User.findOne({
            email: email
        });
        return userExists;
    }
    static async createUser(userData) {
        if (!userData || !userData.email) {
            throw new Error("User data and email are required to create a user");
        }
        const user = new User(userData);
        return await user.save();
    }
    static async hashPassword(password) {
        if (!password) {
            throw new Error("Password is required to hash");
        }
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    static async comparePassword(password, hashedPassword) {
        if (!password || !hashedPassword) {
            throw new Error("Password and hashed password are required to compare");
        }
        return await bcrypt.compare(password, hashedPassword);
    }
    static async getUserById(userId) {
        if (!userId) {
            throw new Error("User ID is required to get user");
        }
        return await User.findById(userId)
    }
}

export default UserService;