import { catchAsync } from '../../configs/catchAsync.js';
import {
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class BaseController {
	constructor(service) {
		if (!service) {
			throw new Error('Service is required');
		}
		this.service = service;
	}
	create = catchAsync(async (req, res) => {
		const data = await this.service.create(req.body);
		if (!data) {
			return formatFail(res, 'Failed to create resource', 400);
		}
		return formatSuccess(res, data, 'Resource created successfully', 201);
	});
	delete = catchAsync(async (req, res) => {
		const data = await this.service.delete(req.params.id);
		if (!data) {
			return formatFail(res, 'Resource not found', 404);
		}
		return formatSuccess(res, null, 'Resource deleted successfully', 200);
	});
	update = catchAsync(async (req, res) => {
		const data = await this.service.update(req.params.id, req.body);
		if (!data) {
			return formatFail(res, 'Resource not found', 404);
		}
		return formatSuccess(res, data, 'Resource updated successfully', 200);
	});
	getById = catchAsync(async (req, res) => {
		const data = await this.service.findById(req.params.id);
		if (!data) {
			return formatFail(res, 'Resource not found', 404);
		}
		return formatSuccess(res, data, 'Resource retrieved successfully', 200);
	});
	getAll = catchAsync(async (req, res) => {
		const query = req.query || {};
		const options = {
			limit: parseInt(query.limit) || 10,
			skip: parseInt(query.skip) || 0,
			sort: query.sort || '-createdAt',
		};
		const data = await this.service.findAll(query, options);
		if (!data || data.length === 0) {
			return formatFail(res, 'No resources found', 404);
		}
		return formatSuccess(res, data, 'Resources retrieved successfully', 200);
	});
	search = catchAsync(async (req, res) => {
		const query = req.query || {};
		const options = {
			limit: parseInt(query.limit) || 10,
			skip: parseInt(query.skip) || 0,
			sort: query.sort || '-createdAt',
		};
		const data = await this.service.search(query, options);
		if (!data || data.length === 0) {
			return formatFail(res, 'No resources found', 404);
		}
		return formatSuccess(res, data, 'Resources retrieved successfully', 200);
	});
	filter = catchAsync(async (req, res) => {
		const query = req.query || {};
		const options = {
			limit: parseInt(query.limit) || 10,
			skip: parseInt(query.skip) || 0,
			sort: query.sort || '-createdAt',
		};
		const data = await this.service.filter(query, options);
		if (!data || data.length === 0) {
			return formatFail(res, 'No resources found', 404);
		}
		return formatSuccess(res, data, 'Resources retrieved successfully', 200);
	});
}

export default BaseController;
