'use strict';
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
			const updatedData = await this.model.findByIdAndUpdate(id, data, {
				new: true,
			});
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
	async findAll(query = {}, options = {}) {
		try {
			const data = await this.model.find(query, null, options);
			return data;
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
}

export default BaseRepository;
