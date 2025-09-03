import { catchAsync } from '../../configs/catchAsync.js';
import BaseController from '../../core/controller/base.controller.js';
import BrandService from './brand.service.js';
import { formatSuccess, formatFail } from '../../shared/response/responseFormatter.js';
import { StatusCodes } from 'http-status-codes';

class BrandController extends BaseController {
	constructor() {
		super(BrandService);
	}
	getActiveBrands = catchAsync(async (req, res) => {
		const brands = await this.service.getActiveBrands();
		return formatSuccess({
			res,
			data: brands,
			message: 'Active brands retrieved successfully',
			code: StatusCodes.OK,
		});
	});
	getBrandsPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search = '', isActive } = req.query;

		const result = await this.service.getBrandsPaginated({
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

		const brand = await this.service.toggleBrandStatus(id);
		return formatSuccess({
			res,
			data: brand,
			message: 'Brand status updated successfully',
			code: StatusCodes.OK,
		});
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

		const brand = await this.service.getBrandByName(name);
		return formatSuccess({
			res,
			data: brand,
			message: 'Brand retrieved successfully',
			code: StatusCodes.OK,
		});
	});
}

export default new BrandController();