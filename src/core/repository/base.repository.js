'use strict';
import bcrypt from 'bcrypt';
import { getPaginationMeta } from '../../shared/response/pagination.js';
class BaseRepository {
	constructor(model) {
		if (!model) {
			throw new Error('Model is required');
		}
		this.model = model;
	}
	async create(data) {
		try {
			const createdData = await this.model.create(data);
			return createdData;
		} catch (error) {
			throw new Error('Error creating data: ' + error.message);
		}
	}
	async findById(id) {
		try {
			const data = await this.model.findById(id);
			if (!data) {
				throw new Error('Data not found');
			}
			return data;
		} catch (error) {
			throw new Error('Error finding data: ' + error.message);
		}
	}
	async update(id, data) {
		try {
			if (!id || !data || typeof data !== 'object') {
				throw new Error('Invalid ID or data for update');
			}

			const updatedData = await this.model.findByIdAndUpdate(
				id,
				{ $set: data },
				{ new: true }
			);

			if (!updatedData) {
				throw new Error('Data not found for update');
			}

			return updatedData;
		} catch (error) {
			throw new Error('Error updating data: ' + error.message);
		}
	}
	async delete(id) {
		try {
			const deletedData = await this.model.findByIdAndDelete(id);
			if (!deletedData) {
				throw new Error('Data not found for deletion');
			}
			return deletedData;
		} catch (error) {
			throw new Error('Error deleting data: ' + error.message);
		}
	}
	async findAll(query = {}, options = {}, page = 1, limit = 10) {
		try {
			// Nếu không có page hoặc limit, trả về tất cả data
			if (!page || !limit || page === 1 && limit === 10 && Object.keys(options).length === 0) {
				const data = await this.model.find(query).lean();
				return { data, pagination: null };
			}
			
			const skip = (page - 1) * limit;
			const data = await this.model
				.find(query, null, {
					...options,
				})
				.skip(skip)
				.limit(limit)
				.lean();
			const total = await this.model.countDocuments(query);
			const pagination = getPaginationMeta(page, limit, total);
			return { data, pagination };
		} catch (error) {
			throw new Error('Error finding data: ' + error.message);
		}
	}
	async findOne(query, options = {}) {
		try {
			const data = await this.model.findOne(query, null, options);
			if (!data) {
				throw new Error('Data not found');
			}
			return data;
		} catch (error) {
			throw new Error('Error finding data: ' + error.message);
		}
	}
	async find(query) {
		try {
			const data = await this.model.find(query);
			if (!data || data.length === 0) {
				throw new Error('No data found');
			}
			return data;
		} catch (error) {
			throw new Error('Error finding data: ' + error.message);
		}
	}
	async deleteOne(query) {
		try {
			const deletedData = await this.model.deleteOne(query);
			if (deletedData.deletedCount === 0) {
				throw new Error('No data found for deletion');
			}
			return deletedData;
		} catch (error) {
			throw new Error('Error deleting data: ' + error.message);
		}
	}
	async countDocuments(query = {}) {
		try {
			const count = await this.model.countDocuments(query);
			return count;
		} catch (error) {
			throw new Error('Error counting documents: ' + error.message);
		}
	}
	async hashPassword(password) {
		const salt = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, salt);
	}
	async comparePassword(password, hash) {
		return await bcrypt.compare(password, hash);
	}
	async findEmail(email) {
		try {
			const user = await this.model.findOne({ email });
			if (!user) {
				throw new Error('User not found');
			}
			return user;
		} catch (error) {
			throw new Error('Error finding user by email: ' + error.message);
		}
	}
}

export default BaseRepository;
