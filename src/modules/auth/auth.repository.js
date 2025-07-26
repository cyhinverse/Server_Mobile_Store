import BaseRepository from '../../core/repository/base.repository.js';
import User from '../user/user.model.js';
import bcrypt from 'bcrypt';

class AuthRepository extends BaseRepository {
	constructor() {
		super(User);
	}
	async updateRoleForUser(userId, role) {
		return this.model.findByIdAndUpdate(
			userId,
			{ $set: { roles: role } },
			{ new: true }
		);
	}
	async revokePermissions(userId, permissions) {
		return this.model.findByIdAndUpdate(
			userId,
			{ $pull: { permissions: permissions } },
			{ new: true }
		);
	}
	async assignPermissions(id, permissions) {
		return this.model.findByIdAndUpdate(
			id,
			{ $addToSet: { permissions: permissions } },
			{ new: true }
		);
	}
	async checkComparePassword(userId, passsword) {
		const user = await this.model.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}
		const isMatch = await bcrypt.compare(passsword, user.passsword);
		if (!isMatch) {
			throw new Error('Password does not match');
		}
		return isMatch;
	}
	async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}
	async updatePasswordForUser(userId, newPassword) {
		return this.model.findByIdAndUpdate(
			userId,
			{ password: newPassword },
			{ new: true, runValidators: true }
		);
	}
	async updateUser(userId, updateData) {
		return this.model.findByIdAndUpdate(userId, updateData, { new: true });
	}
}

export default new AuthRepository();
