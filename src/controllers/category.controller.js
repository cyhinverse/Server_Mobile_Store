import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../configs/catchAsync';
import categoryService from '../services/category.service';
import chalk from 'chalk';
import { ValidationCategory } from '../validations/category.validation';

class CategoryController {
	constructor() {
		this.categoryService = categoryService;
	}
	createCategory = catchAsync(async (req, res) => {
		const { name, parentId, description } = req.body;
		if (!name || !parentId || !description) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Name, parentId, and description are required!'),
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
				message: chalk.red(error.details[0].message),
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
				.json({ message: chalk.red('Category creation failed!') });
		}
		return res.status(StatusCodes.CREATED).json({
			message: chalk.green('Category created successfully'),
			data: newCategory,
		});
	});
	deleteCategory = catchAsync(async (req, res) => {
		const { id } = req.params;
		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('Category ID is required!'),
			});
		}
		let _validationCategory = ValidationCategory.deleteCategory;
		const { error } = _validationCategory.validate({ id });
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red(error.details[0].message),
			});
		}
		const deleted = await this.categoryService.deleteCategory(id);
		if (!deleted) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: chalk.red('Category not found') });
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Category deleted successfully'),
		});
	});
	updateCategory = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { name, parentId, description } = req.body;

		if (!id || !name || !parentId || !description) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('ID, name, parentId, and description are required!'),
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
				message: chalk.red(error.details[0].message),
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
				.json({ message: chalk.red('Category update field !') });
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Category updated successfully'),
			data: updateCategory,
		});
	});
}

export default new CategoryController();
