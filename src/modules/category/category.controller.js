import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import categoryService from './category.service.js';
import { ValidationCategory } from './category.validation.js';
import {
	formatSuccess,
	formatFail,
} from '../../shared/response/responseFormatter.js';
import BaseController from '../../core/controller/base.controller.js';

class CategoryController extends BaseController {
	constructor() {
		super(categoryService);
	}

	/**
	 * Create new category
	 * POST /api/categories
	 */
	createCategory = catchAsync(async (req, res) => {
		const { error } = ValidationCategory.createCategory.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const category = await categoryService.createCategory(req.body);

		return formatSuccess({
			res,
			data: category,
			message: 'Category created successfully',
			code: StatusCodes.CREATED,
		});
	});

	/**
	 * Get all categories
	 * GET /api/categories
	 */
	getAllCategories = catchAsync(async (req, res) => {
		const result = await categoryService.getAllCategories();

		// BaseRepository.findAll returns { data, pagination }
		const categories = result?.data || result || [];

		return formatSuccess({
			res,
			data: { categories },
			message: 'Categories retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get category by ID
	 * GET /api/categories/:id
	 */
	getCategoryById = catchAsync(async (req, res) => {
		const { id } = req.params;

		const category = await categoryService.getCategoryById(id);

		return formatSuccess({
			res,
			data: category,
			message: 'Category retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get category by slug
	 * GET /api/categories/slug/:slug
	 */
	getCategoryBySlug = catchAsync(async (req, res) => {
		const { slug } = req.params;

		const category = await categoryService.getCategoryBySlug(slug);

		return formatSuccess({
			res,
			data: category,
			message: 'Category retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get category tree structure
	 * GET /api/categories/tree
	 */
	getTreeCategories = catchAsync(async (req, res) => {
		const categoryTree = await categoryService.getTreeCategories();

		return formatSuccess({
			res,
			data: categoryTree,
			message: 'Category tree retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get categories with pagination
	 * GET /api/categories/paginated
	 */
	getCategoriesPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search = '' } = req.query;

		const paginationData = await categoryService.getCategoriesPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
			search,
		});

		return formatSuccess({
			res,
			data: paginationData.categories,
			message: 'Categories retrieved with pagination successfully',
			code: StatusCodes.OK,
			meta: {
				pagination: {
					page: paginationData.page,
					pageSize: paginationData.pageSize,
					totalItems: paginationData.totalItems,
					totalPages: paginationData.totalPages,
					hasNextPage: paginationData.hasNextPage,
					hasPrevPage: paginationData.hasPrevPage,
				},
			},
		});
	});

	/**
	 * Get children categories by parent ID
	 * GET /api/categories/:parentId/children
	 */
	getChildrenCategories = catchAsync(async (req, res) => {
		const { parentId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		const result = await categoryService.getChildrenCategories(
			parentId,
			parseInt(page),
			parseInt(limit)
		);

		return formatSuccess({
			res,
			data: result.categories,
			message: 'Children categories retrieved successfully',
			code: StatusCodes.OK,
			meta: {
				pagination: {
					page: result.page,
					pageSize: result.pageSize,
					totalItems: result.totalItems,
					totalPages: result.totalPages,
					hasNextPage: result.hasNextPage,
					hasPrevPage: result.hasPrevPage,
				},
			},
		});
	});

	/**
	 * Update category
	 * PUT /api/categories/:id
	 */
	updateCategory = catchAsync(async (req, res) => {
		const { id } = req.params;

		const { error } = ValidationCategory.updateCategory.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const category = await categoryService.updateCategory(id, req.body);

		return formatSuccess({
			res,
			data: category,
			message: 'Category updated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Delete category
	 * DELETE /api/categories/:id
	 */
	deleteCategory = catchAsync(async (req, res) => {
		const { id } = req.params;

		await categoryService.deleteCategory(id);

		return formatSuccess({
			res,
			data: null,
			message: 'Category deleted successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get category statistics
	 * GET /api/categories/stats
	 */
	getCategoryStats = catchAsync(async (req, res) => {
		const stats = await categoryService.getCategoryStats();

		return formatSuccess({
			res,
			data: stats,
			message: 'Category statistics retrieved successfully',
			code: StatusCodes.OK,
		});
	});
}

export default new CategoryController();
