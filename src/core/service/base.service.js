class BaseService {
	constructor(repository) {
		this.repository = repository;
	}

	async findAll(query = {}) {
		return await this.repository.findAll(query);
	}

	async findById(id) {
		return await this.repository.findById(id);
	}

	async create(data) {
		return await this.repository.create(data);
	}

	async update(id, data) {
		return await this.repository.update(id, data);
	}

	async delete(id) {
		return await this.repository.delete(id);
	}
}

export default BaseService;
