import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import BaseController from '../../core/controller/base.controller.js';
import userService from './user.service.js';
import UserValidation from './user.validation.js';
import {
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class UserController extends BaseController {
	constructor() {
		super(userService);
		this.userService = userService;
	}

	/**
	 * Create new user (Admin function)
	 */
	createUser = catchAsync(async (req, res) => {
		// Validation
		const { error } = UserValidation.createUserValidation.validate(req.body);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await this.userService.createUser(req.body);

		return formatSuccess({
			res,
			data: user,
			message: 'User created successfully',
			code: StatusCodes.CREATED,
		});
	});

	/**
	 * Get all users with pagination
	 */
	getAllUsers = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search, role } = req.query;

		// Validation
		const { error } = UserValidation.getUsersPaginatedValidation.validate(
			req.query
		);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const result = await this.userService.getUsersPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
			search,
			role,
		});

		return formatSuccess({
			res,
			data: result,
			message: 'Users retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get user by ID
	 */
	getUserById = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validation
		const { error } = UserValidation.getUserByIdValidation.validate({ userId });
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await this.userService.getUserById(userId);

		return formatSuccess({
			res,
			data: user,
			message: 'User retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Update user
	 */
	updateUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validation
		const { error } = UserValidation.updateUserValidation.validate({
			userId,
			...req.body,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await this.userService.updateUser(userId, req.body);

		return formatSuccess({
			res,
			data: user,
			message: 'User updated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Delete user
	 */
	deleteUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validation
		const { error } = UserValidation.deleteUserValidation.validate({ userId });
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		await this.userService.deleteUser(userId);

		return formatSuccess({
			res,
			data: null,
			message: 'User deleted successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Add address to user
	 */
	addAddress = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validation
		const { error } = UserValidation.addAddressValidation.validate({
			userId,
			...req.body,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const address = await this.userService.addAddress(userId, req.body);

		return formatSuccess({
			res,
			data: address,
			message: 'Address added successfully',
			code: StatusCodes.CREATED,
		});
	});

	/**
	 * Update user address
	 */
	updateAddress = catchAsync(async (req, res) => {
		const { userId, addressId } = req.params;

		// Validation
		const { error } = UserValidation.updateAddressValidation.validate({
			userId,
			addressId,
			...req.body,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const address = await this.userService.updateAddress(
			userId,
			addressId,
			req.body
		);

		return formatSuccess({
			res,
			data: address,
			message: 'Address updated successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Delete user address
	 */
	deleteAddress = catchAsync(async (req, res) => {
		const { userId, addressId } = req.params;

		// Validation
		const { error } = UserValidation.deleteAddressValidation.validate({
			userId,
			addressId,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		await this.userService.deleteAddress(userId, addressId);

		return formatSuccess({
			res,
			data: null,
			message: 'Address deleted successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Set default address
	 */
	setDefaultAddress = catchAsync(async (req, res) => {
		const { userId, addressId } = req.params;

		// Validation
		const { error } = UserValidation.setDefaultAddressValidation.validate({
			userId,
			addressId,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const address = await this.userService.setDefaultAddress(userId, addressId);

		return formatSuccess({
			res,
			data: address,
			message: 'Default address set successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get user addresses
	 */
	getAddressesByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validation
		const { error } = UserValidation.getUserAddressesValidation.validate({
			userId,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const addresses = await this.userService.getAddressesByUser(userId);

		return formatSuccess({
			res,
			data: addresses,
			message: 'User addresses retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get address by ID
	 */
	getAddressById = catchAsync(async (req, res) => {
		const { userId, addressId } = req.params;

		// Validation
		const { error } = UserValidation.getAddressByIdValidation.validate({
			userId,
			addressId,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const address = await this.userService.getAddressById(userId, addressId);

		return formatSuccess({
			res,
			data: address,
			message: 'Address retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get default address
	 */
	getDefaultAddress = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validation
		const { error } = UserValidation.getDefaultAddressValidation.validate({
			userId,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const address = await this.userService.getDefaultAddress(userId);

		return formatSuccess({
			res,
			data: address,
			message: 'Default address retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get all addresses with pagination (Admin function)
	 */
	getAllAddressesPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10 } = req.query;

		// Validation
		const { error } = UserValidation.getAddressesPaginatedValidation.validate(
			req.query
		);
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const result = await this.userService.getAllAddressesPaginated({
			page: parseInt(page),
			limit: parseInt(limit),
		});

		return formatSuccess({
			res,
			data: result,
			message: 'Addresses retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Count addresses by user
	 */
	countAddressesByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validation
		const { error } = UserValidation.countAddressesByUserValidation.validate({
			userId,
		});
		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const count = await this.userService.countAddressesByUser(userId);

		return formatSuccess({
			res,
			data: { count },
			message: 'Address count retrieved successfully',
			code: StatusCodes.OK,
		});
	});

	/**
	 * Get user statistics (Admin function)
	 */
	getUserStats = catchAsync(async (req, res) => {
		const stats = await this.userService.getUserStats();

		return formatSuccess({
			res,
			data: stats,
			message: 'User statistics retrieved successfully',
			code: StatusCodes.OK,
		});
	});
}

export default new UserController();
