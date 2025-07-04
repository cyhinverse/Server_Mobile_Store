import { catchAsync } from '../configs/catchAsync.js';
import category from '../models/category.model.js';

class CategoryService {
	constructor() {
		if (CategoryService.instance) return CategoryService.instance;
		this.model = category;
		CategoryService.instance = this;
	}

	createCategory = catchAsync(async (data) => {
		const { name, slug, parentId, description } = data;
		if (!name || !slug || !description) {
			throw new Error('Name, slug, and description are required');
		}
		const category = new this.model({ name, slug, parentId, description });
		return await category.save();
	});

	deleteCategory = catchAsync(async (id) => {
		if (!id) {
			throw new Error('Category ID is required');
		}
		const category = await this.model.findByIdAndDelete(id);
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});

	updateCategory = catchAsync(async (id, data) => {
		if (!id || !data) {
			throw new Error('Category ID and update data are required');
		}
		const category = await this.model.findByIdAndUpdate(id, data, {
			new: true,
		});
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});

	getTreeCategories = catchAsync(async () => {
		const categories = await this.model.aggregate([
			{ $match: { parentId: null } },
			{
				$graphLookup: {
					from: 'categories',
					startWith: '$_id',
					connectFromField: '_id',
					connectToField: 'parentId',
					as: 'children',
				},
			},
		]);
		return categories;
	});

	getCategoryById = catchAsync(async (id) => {
		if (!id) {
			throw new Error('Category ID is required');
		}
		const category = await this.model.findById(id);
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});

	getCategoryBySlug = catchAsync(async (slug) => {
		if (!slug) {
			throw new Error('Category slug is required');
		}
		const category = await this.model.findOne({ slug });
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});
}

export default new CategoryService();
