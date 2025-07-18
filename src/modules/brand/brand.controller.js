import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import brandService from './brand.service.js';
import { ValidationBrand } from './brand.validation.js';

class BrandController {
	constructor() {
		this.brandService = brandService;
	}

	createBrand = catchAsync(async (req, res) => {
		const { name, logo, description, isActive } = req.body;

		if (!name) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Name is required!',
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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const newBrand = await this.brandService.createBrand({
				name,
				logo,
				description,
				isActive,
			});

			return res.status(StatusCodes.CREATED).json({
				message: 'Brand created successfully',
				data: newBrand,
			});
		} catch (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.message,
			});
		}
	});

	deleteBrand = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Brand ID is required!',
			});
		}

		const validationBrand = ValidationBrand.deleteBrand;
		const { error } = validationBrand.validate({ id });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const deleted = await this.brandService.deleteBrand(id);
			return res.status(StatusCodes.OK).json({
				message: 'Brand deleted successfully',
				data: deleted,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
			});
		}
	});

	updateBrand = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { name, logo, description, isActive } = req.body;

		if (!id) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Brand ID is required!',
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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const updateData = {};
			if (name !== undefined) updateData.name = name;
			if (logo !== undefined) updateData.logo = logo;
			if (description !== undefined) updateData.description = description;
			if (isActive !== undefined) updateData.isActive = isActive;

			const updatedBrand = await this.brandService.updateBrand(id, updateData);

			return res.status(StatusCodes.OK).json({
				message: 'Brand updated successfully',
				data: updatedBrand,
			});
		} catch (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.message,
			});
		}
	});

	getAllBrands = catchAsync(async (req, res) => {
		try {
			const brands = await this.brandService.getAllBrands();
			return res.status(StatusCodes.OK).json({
				message: 'Brands retrieved successfully',
				data: brands,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error.message,
			});
		}
	});

	getActiveBrands = catchAsync(async (req, res) => {
		try {
			const brands = await this.brandService.getActiveBrands();
			return res.status(StatusCodes.OK).json({
				message: 'Active brands retrieved successfully',
				data: brands,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error.message,
			});
		}
	});

	getBrandById = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Brand ID is required!',
			});
		}

		const validationBrand = ValidationBrand.getBrandById;
		const { error } = validationBrand.validate({ id });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const brand = await this.brandService.getBrandById(id);
			return res.status(StatusCodes.OK).json({
				message: 'Brand retrieved successfully',
				data: brand,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const result = await this.brandService.getBrandsPaginated({
				page: Number(page),
				limit: Number(limit),
				search,
				isActive: isActive ? JSON.parse(isActive) : undefined,
			});

			return res.status(StatusCodes.OK).json({
				message: 'Brands retrieved successfully',
				...result,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error.message,
			});
		}
	});

	toggleBrandStatus = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Brand ID is required!',
			});
		}

		try {
			const brand = await this.brandService.toggleBrandStatus(id);
			return res.status(StatusCodes.OK).json({
				message: 'Brand status updated successfully',
				data: brand,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
			});
		}
	});

	getBrandByName = catchAsync(async (req, res) => {
		const { name } = req.params;

		if (!name) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Brand name is required!',
			});
		}

		try {
			const brand = await this.brandService.getBrandByName(name);
			return res.status(StatusCodes.OK).json({
				message: 'Brand retrieved successfully',
				data: brand,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
			});
		}
	});
}

export default new BrandController();
