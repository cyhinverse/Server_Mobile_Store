import BaseRepository from '../../core/repository/base.repository.js';
import User from '../user/user.model.js';

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
}

export default new AuthRepository();
