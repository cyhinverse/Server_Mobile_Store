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
	async checkComparePassword(password, hashedPassword) {
		if (!password || !hashedPassword) {
			throw new Error('Password and hashed password are required');
		}
		const isMatch = await bcrypt.compare(password, hashedPassword);
		return isMatch;
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
	async checkUserExists(email) {
		return this.model.findOne({ email });
	}
}

export default new AuthRepository();
