import { catchAsync } from '../../configs/catchAsync.js';
import brandModel from './brand.model.js';

class BrandService {
	constructor() {
		if (BrandService.instance) return BrandService.instance;
		this.model = brandModel;
		BrandService.instance = this;
	}

	createBrand = catchAsync(async (data) => {
		const { name, logo, description, isActive } = data;
		if (!name) {
			throw new Error('Name is required');
		}

		// Check if brand name already exists
		const nameExists = await this.model.findOne({ name });
		if (nameExists) {
			throw new Error('Brand name already exists');
		}

		const brand = new this.model({
			name,
			logo: logo || '',
			description: description || '',
			isActive: isActive !== undefined ? isActive : true,
		});
		return await brand.save();
	});

	getAllBrands = catchAsync(async () => {
		return await this.model.find().sort({ name: 1 });
	});

	getActiveBrands = catchAsync(async () => {
		return await this.model.find({ isActive: true }).sort({ name: 1 });
	});

	getBrandById = catchAsync(async (id) => {
		if (!id) throw new Error('Brand ID is required');
		const brand = await this.model.findById(id);
		if (!brand) throw new Error('Brand not found');
		return brand;
	});

	getBrandsPaginated = catchAsync(
		async ({ page = 1, limit = 10, search = '', isActive }) => {
			const query = {};

			if (search) {
				query.name = { $regex: search, $options: 'i' };
			}

			if (isActive !== undefined) {
				query.isActive = isActive;
			}

			const brands = await this.model
				.find(query)
				.skip((page - 1) * limit)
				.limit(limit)
				.sort({ name: 1 });

			const total = await this.model.countDocuments(query);
			return {
				data: brands,
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit),
			};
		}
	);

	updateBrand = catchAsync(async (id, data) => {
		if (!id || !data) {
			throw new Error('Brand ID and update data are required');
		}

		// Check if the new name already exists (excluding current brand)
		if (data.name) {
			const nameExists = await this.model.findOne({
				name: data.name,
				_id: { $ne: id },
			});
			if (nameExists) {
				throw new Error('Brand name already exists');
			}
		}

		const brand = await this.model.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true,
		});
		if (!brand) throw new Error('Brand not found');
		return brand;
	});

	deleteBrand = catchAsync(async (id) => {
		if (!id) throw new Error('Brand ID is required');

		const deleted = await this.model.findByIdAndDelete(id);
		if (!deleted) throw new Error('Brand not found');
		return deleted;
	});

	toggleBrandStatus = catchAsync(async (id) => {
		if (!id) throw new Error('Brand ID is required');

		const brand = await this.model.findById(id);
		if (!brand) throw new Error('Brand not found');

		brand.isActive = !brand.isActive;
		return await brand.save();
	});

	getBrandByName = catchAsync(async (name) => {
		if (!name) throw new Error('Brand name is required');
		const brand = await this.model.findOne({ name });
		if (!brand) throw new Error('Brand not found');
		return brand;
	});
}

export default new BrandService();
