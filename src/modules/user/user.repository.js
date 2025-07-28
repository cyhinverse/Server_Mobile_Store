import { Types } from 'mongoose';
import BaseRepository from '../../core/repository/base.repository.js';
import User from './user.model.js';

class UserRepository extends BaseRepository {
	constructor() {
		super(User);
		if (UserRepository.instance) return UserRepository.instance;
		UserRepository.instance = this;
	}
	async save(user) {
		return user.save();
	}
	async getAddressesByUserId(userId) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		return this.model.findById(userId).select('address').lean();
	}
	async getAddressById(userId, addressId) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const result = await this.model
			.findOne({ _id: userId, 'address._id': addressId }, { 'address.$': 1 })
			.lean();

		console.log(
			`Fetching address for userId: ${userId}, addressId: ${addressId}`,
			result
		);

		return result;
	}
	async findOne(query, options = {}) {
		return this.model.findOne(query, options).lean();
	}
}

export default new UserRepository();
