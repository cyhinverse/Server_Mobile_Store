import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

class UserService {
	static async checkUserExists(phoneNumber) {
		if (!phoneNumber) {
			throw new Error('Email is required to check user existence');
		}
		const userExists = await User.findOne({
			phoneNumber: phoneNumber,
		});
		return userExists;
	}
	static async createUser(userData) {
		if (!userData || !userData.email) {
			throw new Error('User data and email are required to create a user');
		}
		const user = new User(userData);
		return await user.save();
	}
	static async hashPassword(password) {
		if (!password) {
			throw new Error('Password is required to hash');
		}
		const saltRounds = 10;
		return await bcrypt.hash(password, saltRounds);
	}
	static async comparePassword(password, hashedPassword) {
		if (!password || !hashedPassword) {
			throw new Error('Password and hashed password are required to compare');
		}
		return await bcrypt.compare(password, hashedPassword);
	}
	static async getUserById(userId) {
		if (!userId) {
			throw new Error('User ID is required to get user');
		}
		return await User.findById(userId);
	}
	static async deleteUser(userId) {
		if (!userId) {
			throw new Error('User ID is required to delete user');
		}
		return await User.findByIdAndDelete(userId);
	}
	static async updateUser(userId, updateData) {
		if (!userId || !updateData) {
			throw new Error('User ID and update data are required to update user');
		}
		return await User.findByIdAndUpdate(userId, updateData, { new: true });
	}
	static async getAllUser() {
		return await User.find();
	}
	static async generateResetToken(userId) {
		if (!userId) {
			throw new Error('User ID is required to generate reset token');
		}
		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}
		const resetToken = await bcrypt.hash(user.email + Date.now(), 10);
		user.resetToken = resetToken;
		await user.save();
	}
}

export default UserService;
