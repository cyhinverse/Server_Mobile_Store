import dotenv from 'dotenv';
import authRepository from './auth.repository.js';
import BaseService from '../../core/service/base.service.js';
import {
	getPermissionsByRole,
	validatePermissions,
} from '../../configs/permission.config.js';
dotenv.config();
class AuthService extends BaseService {
	constructor() {
		super(authRepository);
		this.authRepo = authRepository;
	}
	async verifyEmailCode(code) {
		if (!code) {
			throw new Error('Email verification code is required');
		}
		const user = await this.authRepo.model.findOne({ codeVerify: code });
		if (!user) {
			return null;
		}
		if (user.codeVerifyExpires < Date.now()) {
			throw new Error('Email verification code has expired');
		}
		return user;
	}
	async updateUser(userId, updateData) {
		if (!userId || !updateData) {
			throw new Error('User ID and update data are required');
		}
		return this.authRepo.update(userId, updateData);
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

		// Validate permissions before assigning
		const validation = validatePermissions(permissions);
		if (!validation.valid) {
			throw new Error(
				`Invalid permission(s): ${validation.invalid.join(', ')}`
			);
		}

		return this.authRepo.assignPermissions(id, permissions);
	}
	async revokePermissions(userId, permissions) {
		if (!userId || !permissions) {
			throw new Error('User ID and permissions are required');
		}

		// Validate permissions before revoking
		const validation = validatePermissions(permissions);
		if (!validation.valid) {
			throw new Error(
				`Invalid permission(s): ${validation.invalid.join(', ')}`
			);
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

		// Get user first
		const user = await this.authRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Update role
		const updatedUser = await this.authRepo.updateRoleForUser(userId, role);

		// Populate permissions based on new role
		const permissions = getPermissionsByRole(role);
		await this.authRepo.update(userId, { permissions });

		return updatedUser;
	}
	async create(userData) {
		if (!userData) {
			throw new Error('User data is required for creation');
		}

		// Auto-populate permissions based on role
		if (!userData.permissions && userData.role) {
			userData.permissions = getPermissionsByRole(userData.role);
		}

		return this.authRepo.create(userData);
	}
	async checkUserExists(email) {
		if (!email) {
			throw new Error('Email is required');
		}
		return this.authRepo.checkUserExists(email);
	}
	async checkComparePassword(password, hashedPassword) {
		if (!password || !hashedPassword) {
			throw new Error('Password and hashed password are required');
		}
		return this.authRepo.checkComparePassword(password, hashedPassword);
	}
	async hashPassword(password) {
		if (!password) {
			throw new Error('Password is required');
		}
		return this.authRepo.hashPassword(password);
	}
	async updatePasswordForUser(userId, newPassword) {
		if (!userId || !newPassword)
			throw new Error('User ID and new password are required');
		return this.authRepo.updatePasswordForUser(userId, newPassword);
	}
}

export default new AuthService();
