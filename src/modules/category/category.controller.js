import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import categoryService from './category.service.js';
import { ValidationCategory } from './category.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';
class CategoryController {
	constructor() {
		this.categoryService = categoryService;
	}
	createCategory = catchAsync(async (req, res) => {
		const { name, parentId, description } = req.body;
		if (!name || !parentId || !description) {
			return formatFail({
				res,
				message: 'Name, parentId, and description are required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		let _validationCategory = ValidationCategory.createCategory;
		const { error } = _validationCategory.validate({
			name,
			parentId,
			description,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const newCategory = await this.categoryService.createCategory({
			name,
			parentId,
			description,
		});
		if (!newCategory) {
			return formatError({
				res,
				message: 'Category creation failed!',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			data: newCategory,
			message: 'Category created successfully',
			code: StatusCodes.CREATED,
		});
	});
	deleteCategory = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id || id === 'undefined') {
			return formatFail({
				res,
				message: 'Category ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		let _validationCategory = ValidationCategory.deleteCategory;
		const { error } = _validationCategory.validate({ id });
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const deleted = await this.categoryService.deleteCategory(id);
		if (!deleted) {
			return formatFail({
				res,
				message: 'Category not found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			message: 'Category deleted successfully',
			code: StatusCodes.OK,
		});
	});
	updateCategory = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { name, parentId, description } = req.body;

		if (!id || !name || !parentId || !description) {
			return formatFail({
				res,
				message: 'ID, name, parentId, and description are required!',
				code: StatusCodes.BAD_REQUEST,
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
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const updateCategory = await this.categoryService.updateCategory(id, {
			name,
			parentId,
			description,
		});
		if (!updateCategory) {
			return formatError({
				res,
				message: 'Category update failed!',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		return formatSuccess({
			res,
			data: updateCategory,
			message: 'Category updated successfully',
			code: StatusCodes.OK,
		});
	});
	getAllCategories = catchAsync(async (req, res) => {
		const categories = await this.categoryService.getAllCategories();
		if (!categories || categories.length === 0) {
			return formatFail({
				res,
				message: 'No categories found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: categories,
			message: 'All categories fetched successfully',
			code: StatusCodes.OK,
		});
	});

	getTreeCategories = catchAsync(async (req, res) => {
		const tree = await this.categoryService.getTreeCategories();
		if (!tree || tree.length === 0) {
			return formatFail({
				res,
				message: 'No tree categories found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: tree,
			message: 'Tree categories fetched successfully',
			code: StatusCodes.OK,
		});
	});

	getCategoryById = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id || id === 'undefined') {
			return formatFail({
				res,
				message: 'Category ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		let _validationCategory = ValidationCategory.getCategoryById;
		const { error } = _validationCategory.validate({ id });
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const category = await this.categoryService.getCategoryById(id);
		if (!category) {
			return formatFail({
				res,
				message: 'Category not found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: category,
			message: 'Category fetched successfully',
			code: StatusCodes.OK,
		});
	});

	getCategoryBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;
		if (!slug) {
			return formatFail({
				res,
				message: 'Category slug is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		let _validationCategory = ValidationCategory.getCategoryBySlug;
		const { error } = _validationCategory.validate({ slug });
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}
		const category = await this.categoryService.getCategoryBySlug(slug);
		if (!category) {
			return formatFail({
				res,
				message: 'Category not found',
				code: StatusCodes.NOT_FOUND,
			});
		}
		return formatSuccess({
			res,
			data: category,
			message: 'Category fetched successfully',
			code: StatusCodes.OK,
		});
	});

	getCategoriesPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search = '' } = req.query;

		const paginationData = await this.categoryService.getCategoriesPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
			search,
		});

		return formatSuccess({
			res,
			data: paginationData.data,
			message: 'Categories fetched with pagination successfully',
			code: StatusCodes.OK,
			meta: {
				pagination: paginationData.pagination,
			},
		});
	});
}

export default new CategoryController();
