import { catchAsync } from '../configs/catchAsync.js';
import { Category } from '../models/category.model.js';

class CategoryService {
	constructor() {
		if (CategoryService.instance) return CategoryService.instance;
		this.model = Category;
		CategoryService.instance = this;
	}
	createCategory = catchAsync(async (data) => {
		const { name, parentId, description } = data;
		if (!name || !slug || !description) {
			throw new Error('Name, slug, and description are required');
		}
		const category = new Category({
			name,
			parentId,
			description,
		});
		return await category.save();
	});
	deleteCategory = catchAsync(async (id) => {
		if (!id) {
			throw new Error('Category ID is required');
		}
		const category = await Category.findByIdAndDelete(id);
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});
	updateCategory = catchAsync(async (id, data) => {
		if (!id || !data) {
			throw new Error('Category ID and update data are required');
		}
		const category = await Category.findByIdAndUpdate(id, data, { new: true });
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});
	getTreeCategories = catchAsync(async () => {
		const categories = await Category.aggregate([
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
		const category = await Category.findById(id);
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});
	getCategoryBySlig = catchAsync(async (slug) => {
		if (!slug) {
			throw new Error('Category slug is required');
		}
		const category = await Category.findOne({ slug });
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	});
}

export default new CategoryService();
