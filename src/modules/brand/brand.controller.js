import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import brandService from './brand.service.js';
import { ValidationBrand } from './brand.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class BrandController {
	constructor() {
		this.brandService = brandService;
	}
	createBrand = catchAsync(async (req, res) => {
		const { name, logo, description, isActive } = req.body;

		if (!name) {
			return formatFail({
				res,
				message: 'Name is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const validationBrand = ValidationBrand.createBrand;
		const { error } = validationBrand.validate({
			name,
			logo,
			description,
			isActive,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		const newBrand = await this.brandService.createBrand({
			name,
			logo,
			description,
			isActive,
		});
		if (!newBrand) {
			return formatError({
				res,
				message: 'Failed to create brand',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return formatSuccess({
			res,
			data: newBrand,
			message: 'Brand created successfully',
			code: StatusCodes.CREATED,
		});
	});
	deleteBrand = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return formatFail({
				res,
				message: 'Brand ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const validationBrand = ValidationBrand.deleteBrand;
		const { error } = validationBrand.validate({ id });

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		try {
			const deleted = await this.brandService.deleteBrand(id);
			return formatSuccess({
				res,
				data: deleted,
				message: 'Brand deleted successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatFail({
				res,
				message: error.message,
				code: StatusCodes.NOT_FOUND,
			});
		}
	});
	updateBrand = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { name, logo, description, isActive } = req.body;

		if (!id) {
			return formatFail({
				res,
				message: 'Brand ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const validationBrand = ValidationBrand.updateBrand;
		const { error } = validationBrand.validate({
			id,
			name,
			logo,
			description,
			isActive,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		try {
			const updateData = {};
			if (name !== undefined) updateData.name = name;
			if (logo !== undefined) updateData.logo = logo;
			if (description !== undefined) updateData.description = description;
			if (isActive !== undefined) updateData.isActive = isActive;

			const updatedBrand = await this.brandService.updateBrand(id, updateData);

			return formatSuccess({
				res,
				data: updatedBrand,
				message: 'Brand updated successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatFail({
				res,
				message: error.message,
				code: StatusCodes.BAD_REQUEST,
			});
		}
	});
	getAllBrands = catchAsync(async (req, res) => {
		try {
			const brands = await this.brandService.getAllBrands();
			return formatSuccess({
				res,
				data: brands,
				message: 'Brands retrieved successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	getActiveBrands = catchAsync(async (req, res) => {
		try {
			const brands = await this.brandService.getActiveBrands();
			return formatSuccess({
				res,
				data: brands,
				message: 'Active brands retrieved successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	getBrandById = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return formatFail({
				res,
				message: 'Brand ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const validationBrand = ValidationBrand.getBrandById;
		const { error } = validationBrand.validate({ id });

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		try {
			const brand = await this.brandService.getBrandById(id);
			return formatSuccess({
				res,
				data: brand,
				message: 'Brand retrieved successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatFail({
				res,
				message: error.message,
				code: StatusCodes.NOT_FOUND,
			});
		}
	});
	getBrandsPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search = '', isActive } = req.query;

		const validationBrand = ValidationBrand.getBrandsPaginated;
		const { error } = validationBrand.validate({
			page: Number(page),
			limit: Number(limit),
			search,
			isActive: isActive ? JSON.parse(isActive) : undefined,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
				errors: error.details.map((err) => err.message),
			});
		}

		try {
			const result = await this.brandService.getBrandsPaginated({
				page: Number(page),
				limit: Number(limit),
				search,
				isActive: isActive ? JSON.parse(isActive) : undefined,
			});

			return formatSuccess({
				res,
				data: result.data,
				message: 'Brands retrieved successfully',
				code: StatusCodes.OK,
				meta: {
					pagination: result.pagination,
				},
			});
		} catch (error) {
			return formatError({
				res,
				message: error.message,
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	});
	toggleBrandStatus = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return formatFail({
				res,
				message: 'Brand ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const brand = await this.brandService.toggleBrandStatus(id);
			return formatSuccess({
				res,
				data: brand,
				message: 'Brand status updated successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatFail({
				res,
				message: error.message,
				code: StatusCodes.NOT_FOUND,
			});
		}
	});
	getBrandByName = catchAsync(async (req, res) => {
		const { name } = req.params;

		if (!name) {
			return formatFail({
				res,
				message: 'Brand name is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		try {
			const brand = await this.brandService.getBrandByName(name);
			return formatSuccess({
				res,
				data: brand,
				message: 'Brand retrieved successfully',
				code: StatusCodes.OK,
			});
		} catch (error) {
			return formatFail({
				res,
				message: error.message,
				code: StatusCodes.NOT_FOUND,
			});
		}
	});
}

export default new BrandController();
