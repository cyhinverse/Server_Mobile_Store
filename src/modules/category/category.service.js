import { catchAsync } from '../../configs/catchAsync.js';
import BaseService from '../../core/service/base.service.js';
import categoryRepository from './category.repository.js';

class CategoryService extends BaseService {
	constructor() {
		super(categoryRepository);
		this.categoryRepo = categoryRepository;
	}

	/**
	 * Create new category
	 */
	createCategory = catchAsync(async (data) => {
		const { name, slug, parentId, description } = data;

		// Business validation
		if (!name || !slug || !description) {
			throw new Error('Name, slug, and description are required');
		}

		// Check slug uniqueness
		const slugExists = await this.categoryRepo.isSlugExists(slug);
		if (slugExists) {
			throw new Error('Slug already exists');
		}

		// Validate parent category exists if parentId provided
		if (parentId) {
			const parentCategory = await this.categoryRepo.findById(parentId);
			if (!parentCategory) {
				throw new Error('Parent category not found');
			}
		}

		return await this.categoryRepo.create({
			name,
			slug,
			parentId: parentId || null,
			description,
		});
	});

	/**
	 * Get all categories
	 */
	getAllCategories = catchAsync(async () => {
		return await this.categoryRepo.findAll();
	});

	/**
	 * Get category by ID
	 */
	getCategoryById = catchAsync(async (id) => {
		if (!id) throw new Error('Category ID is required');
		
		const category = await this.categoryRepo.findById(id);
		if (!category) throw new Error('Category not found');
		
		return category;
	});

	/**
	 * Get category by slug
	 */
	getCategoryBySlug = catchAsync(async (slug) => {
		if (!slug) throw new Error('Category slug is required');
		
		const category = await this.categoryRepo.findBySlug(slug);
		if (!category) throw new Error('Category not found');
		
		return category;
	});

	/**
	 * Get category tree structure
	 */
	getTreeCategories = catchAsync(async () => {
		return await this.categoryRepo.getCategoryTree();
	});

	/**
	 * Get categories with pagination
	 */
	getCategoriesPaginated = catchAsync(async ({ page = 1, limit = 10, search = '' }) => {
		// Business logic: Validate pagination parameters
		if (page < 1) throw new Error('Page must be greater than 0');
		if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');

		return await this.categoryRepo.findWithPagination(
			parseInt(page),
			parseInt(limit),
			search
		);
	});

	/**
	 * Get children categories by parent ID
	 */
	getChildrenCategories = catchAsync(async (parentId, page = 1, limit = 10) => {
		if (!parentId) throw new Error('Parent ID is required');

		// Validate parent exists
		const parentCategory = await this.categoryRepo.findById(parentId);
		if (!parentCategory) {
			throw new Error('Parent category not found');
		}

		return await this.categoryRepo.findByParentWithPagination(
			parentId,
			parseInt(page),
			parseInt(limit)
		);
	});

	/**
	 * Update category
	 */
	updateCategory = catchAsync(async (id, data) => {
		if (!id || !data) {
			throw new Error('Category ID and update data are required');
		}

		// Check if category exists
		const existingCategory = await this.categoryRepo.findById(id);
		if (!existingCategory) {
			throw new Error('Category not found');
		}

		// Check slug uniqueness if slug is being updated
		if (data.slug && data.slug !== existingCategory.slug) {
			const slugExists = await this.categoryRepo.isSlugExists(data.slug, id);
			if (slugExists) {
				throw new Error('Slug already exists');
			}
		}

		// Validate parent category if parentId is being updated
		if (data.parentId && data.parentId !== existingCategory.parentId) {
			// Prevent setting parent to itself or its descendants
			if (data.parentId.toString() === id.toString()) {
				throw new Error('Category cannot be its own parent');
			}

			const parentCategory = await this.categoryRepo.findById(data.parentId);
			if (!parentCategory) {
				throw new Error('Parent category not found');
			}
		}

		return await this.categoryRepo.update(id, data);
	});

	/**
	 * Delete category
	 */
	deleteCategory = catchAsync(async (id) => {
		if (!id) throw new Error('Category ID is required');

		const category = await this.categoryRepo.findById(id);
		if (!category) throw new Error('Category not found');

		// Business logic: Handle children categories
		const childrenCount = await this.categoryRepo.countByParent(id);
		if (childrenCount > 0) {
			// Move children to parent's parent or make them root categories
			await this.categoryRepo.updateChildrenParent(id, category.parentId);
		}

		return await this.categoryRepo.delete(id);
	});

	/**
	 * Get category statistics
	 */
	getCategoryStats = catchAsync(async () => {
		const totalCategories = await this.categoryRepo.count();
		const rootCategories = await this.categoryRepo.countByParent(null);
		const childCategories = totalCategories - rootCategories;

		return {
			total: totalCategories,
			root: rootCategories,
			children: childCategories,
		};
	});
}

export default new CategoryService();
