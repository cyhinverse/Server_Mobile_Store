import BaseService from '../../core/service/base.service.js';
import BrandRepository from './brand.repository.js';

class BrandService extends BaseService {
	constructor() {
		super(BrandRepository);
	}
	async getActiveBrands() {
		return await this.repository.find({ isActive: true });
	}

	async getBrandsPaginated({ page = 1, limit = 10, search = '', isActive }) {
		const query = {};

		if (search) {
			query.name = { $regex: search, $options: 'i' };
		}

		if (isActive !== undefined) {
			query.isActive = isActive;
		}

		return await this.repository.findAll(query, {}, page, limit);
	}

	async toggleBrandStatus(id) {
		if (!id) throw new Error('Brand ID is required');

		const brand = await this.repository.findById(id);
		if (!brand) throw new Error('Brand not found');

		brand.isActive = !brand.isActive;
		return await brand.save();
	}

	async getBrandByName(name) {
		if (!name) throw new Error('Brand name is required');
		const brand = await this.repository.findOne({ name });
		if (!brand) throw new Error('Brand not found');
		return brand;
	}
}

export default new BrandService();