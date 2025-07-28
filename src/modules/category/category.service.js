import { catchAsync } from '../../configs/catchAsync.js';
import BaseService from '../../core/service/base.service.js';
import categoryModel from './category.model.js';
import categoryRepository from './category.repository.js';

class CategoryService extends BaseService {
	constructor() {
		if (CategoryService.instance) return CategoryService.instance;
		super(categoryModel);
		CategoryService.instance = this;
		this.categoryRepo = categoryRepository;
	}

	createCategory = catchAsync(async (data) => {
		const { name, slug, parentId, description } = data;
		if (!name || !slug || !description) {
			throw new Error('Name, slug, and description are required');
		}

		const slugExists = await this.model.findOne({ slug });
		if (slugExists) {
			throw new Error('Slug already exists');
		}

		const category = new this.model({ name, slug, parentId, description });
		return await category.save();
	});

	getAllCategories = catchAsync(async () => {
		return await this.model.find();
	});

	getCategoryById = catchAsync(async (id) => {
		if (!id) throw new Error('Category ID is required');
		const category = await this.model.findById(id);
		if (!category) throw new Error('Category not found');
		return category;
	});

	getCategoryBySlug = catchAsync(async (slug) => {
		if (!slug) throw new Error('Category slug is required');
		const category = await this.model.findOne({ slug });
		if (!category) throw new Error('Category not found');
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

	getCategoriesPaginated = catchAsync(
		async ({ page = 1, limit = 10, search = '' }) => {
			const query = search ? { name: { $regex: search, $options: 'i' } } : {};

			const categories = await this.model
				.find(query)
				.skip((page - 1) * limit)
				.limit(limit);

			const total = await this.model.countDocuments(query);
			return { data: categories, total, page, limit };
		}
	);

	updateCategory = catchAsync(async (id, data) => {
		if (!id || !data) {
			throw new Error('Category ID and update data are required');
		}

		if (data.slug) {
			const slugExists = await this.model.findOne({
				slug: data.slug,
				_id: { $ne: id },
			});
			if (slugExists) {
				throw new Error('Slug already exists');
			}
		}

		const category = await this.model.findByIdAndUpdate(id, data, {
			new: true,
		});
		if (!category) throw new Error('Category not found');
		return category;
	});

	deleteCategory = catchAsync(async (id) => {
		if (!id) throw new Error('Category ID is required');

		const deleted = await this.model.findByIdAndDelete(id);
		if (!deleted) throw new Error('Category not found');

		await this.model.updateMany({ parentId: id }, { parentId: null });

		return deleted;
	});
}

export default new CategoryService();
