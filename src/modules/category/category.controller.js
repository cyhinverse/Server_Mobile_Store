import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import categoryService from './category.service.js';
import { ValidationCategory } from './category.validation.js';

class CategoryController {
	constructor() {
		this.categoryService = categoryService;
	}
	createCategory = catchAsync(async (req, res) => {
		const { name, parentId, description } = req.body;
		if (!name || !parentId || !description) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Name, parentId, and description are required!',
			});
		}
		let _validationCategory = ValidationCategory.createCategory;
		const { error } = _validationCategory.validate({
			name,
			parentId,
			description,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const newCategory = await this.categoryService.createCategory({
			name,
			parentId,
			description,
		});
		if (!newCategory) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Category creation failed!' });
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'Category created successfully',
			data: newCategory,
		});
	});
	deleteCategory = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Category ID is required!',
			});
		}
		let _validationCategory = ValidationCategory.deleteCategory;
		const { error } = _validationCategory.validate({ id });
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const deleted = await this.categoryService.deleteCategory(id);
		if (!deleted) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Category not found' });
		}
		return res.status(StatusCodes.OK).json({
			message: 'Category deleted successfully',
		});
	});
	updateCategory = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { name, parentId, description } = req.body;

		if (!id || !name || !parentId || !description) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'ID, name, parentId, and description are required!',
			});
		}
		let _validationCategory = ValidationCategory.updateCategory;
		const { error } = _validationCategory.validate({
			id,
			name,
			parentId,
			description,
		});
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		const updateCategory = await this.categoryService.updateCategory(id, {
			name,
			parentId,
			description,
		});
		if (!updateCategory) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Category update field !' });
		}
		return res.status(StatusCodes.OK).json({
			message: 'Category updated successfully',
			data: updateCategory,
		});
	});
	getAllCategories = catchAsync(async (req, res) => {
		const categories = await this.categoryService.getAllCategories();
		if (!categories || categories.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No categories found',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'All categories fetched successfully',
			data: categories,
		});
	});

	getTreeCategories = catchAsync(async (req, res) => {
		const tree = await this.categoryService.getTreeCategories();
		if (!tree || tree.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No tree categories found',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Tree categories fetched successfully',
			data: tree,
		});
	});

	getCategoryById = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Category ID is required!',
			});
		}
		let _validationCategory = ValidationCategory.getCategoryById;
		const { error } = _validationCategory.validate({ id });
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const category = await this.categoryService.getCategoryById(id);
		if (!category) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Category not found' });
		}
		return res.status(StatusCodes.OK).json({
			message: 'Category fetched successfully',
			data: category,
		});
	});

	getCategoryBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;
		if (!slug) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Category slug is required!',
			});
		}
		let _validationCategory = ValidationCategory.getCategoryBySlug;
		const { error } = _validationCategory.validate({ slug });
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const category = await this.categoryService.getCategoryBySlug(slug);
		if (!category) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Category not found' });
		}
		return res.status(StatusCodes.OK).json({
			message: 'Category fetched successfully',
			data: category,
		});
	});

	getCategoriesPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search = '' } = req.query;

		const paginationData = await this.categoryService.getCategoriesPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
			search,
		});

		return res.status(StatusCodes.OK).json({
			message: 'Categories fetched with pagination successfully',
			...paginationData,
		});
	});
}

export default new CategoryController();
