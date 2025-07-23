import dotenv from 'dotenv';
import AuthRepository from './auth.repository.js';
dotenv.config();
class AuthService {
	constructor() {
		this.authRepo = AuthRepository;
	}
	async verifyEmailCode(code) {
		if (!code) {
			throw new Error('Email verification code is required');
		}
		const user = await this.authRepo.findOne({ codeVerify: code });
		if (user.codeVerifyExpires < Date.now()) {
			throw new Error('Email verification code has expired');
		}
		return user;
	}
	async updateUser(userId, updateData) {
		if (!userId || !updateData) {
			throw new Error('User ID and update data are required');
		}
		return this.authRepo.findByIdAndUpdate(userId, updateData);
	}
	async getUsersByRole(role) {
		if (!role) {
			throw new Error('Role is required to fetch users');
		}
		return this.authRepo.find({ roles: role }).select('-password -__v');
	}
	async assignPermissions(id, permissions) {
		if (!id || !permissions) {
			throw new Error('User ID and permissions are required');
		}
		return this.authRepo.assignPermissions(id, permissions);
	}
	async revokePermissions(userId, permissions) {
		if (!userId || !permissions) {
			throw new Error('User ID and permissions are required');
		}
		return this.authRepo.revokePermissions(userId, permissions);
	}
	async getUserWithPermissions(userId) {
		if (!userId) {
			throw new Error('User ID is required');
		}
		return this.authRepo.findById(userId).select('permissions roles');
	}
	async updateRoleForUser(userId, role) {
		if (!userId || !role) {
			throw new Error('User ID and role are required');
		}
		return this.authRepo.updateRoleForUser(userId, role);
	}
}

export default new AuthService();
