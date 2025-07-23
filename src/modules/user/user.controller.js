import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import UserService from './user.service.js';
import UserValidation from './user.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';

class UserController {
	createUser = catchAsync(async (req, res) => {
		const { fullName, email, password, roles } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(res, 'User data is required', StatusCodes.BAD_REQUEST);
		}

		if (!fullName || !email || !password || !roles) {
			return formatFail(
				res,
				'All fields are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const { error } = UserValidation.createUserValidation.validate(req.body);
		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const hashedPassword = await UserService.hashPassword(password);
		const userData = {
			fullName,
			email,
			password: hashedPassword,
			roles,
		};

		const newUser = await UserService.createUser(userData);
		if (!newUser) {
			return formatError(
				res,
				'Failed to create user',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'User created successfully',
			{ user: newUser },
			StatusCodes.CREATED
		);
	});
	updateUser = catchAsync(async (req, res) => {
		const { id } = req.params;
		const dataUser = req.body;

		// Validate input data
		if (!id) {
			return formatFail(res, 'User ID is required', StatusCodes.BAD_REQUEST);
		}

		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Update data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		const updatedData = await UserService.updateUser(id, dataUser);
		if (!updatedData) {
			return formatFail(res, 'User not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'User updated successfully',
			{ user: updatedData },
			StatusCodes.OK
		);
	});
	deleteUser = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input data
		if (!id) {
			return formatFail(res, 'User ID is required', StatusCodes.BAD_REQUEST);
		}

		const user = await UserService.getUserById(id);
		if (!user) {
			return formatFail(res, 'User not found', StatusCodes.NOT_FOUND);
		}

		await UserService.deleteUser(id);

		return formatSuccess(res, 'User deleted successfully', {}, StatusCodes.OK);
	});
	getUserById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input data
		if (!id) {
			return formatFail(res, 'User ID is required', StatusCodes.BAD_REQUEST);
		}

		const user = await UserService.getUserById(id);
		if (!user) {
			return formatFail(res, 'User not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'User found successfully',
			{ user },
			StatusCodes.OK
		);
	});
	getAllUser = catchAsync(async (req, res) => {
		const users = await UserService.getAllUser();
		if (!users || users.length === 0) {
			return formatFail(res, 'No users found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Users found successfully',
			{ users },
			StatusCodes.OK
		);
	});
	changePassword = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { password, newPassword } = req.body;

		// Validate input data
		if (!id) {
			return formatFail(res, 'User ID is required', StatusCodes.BAD_REQUEST);
		}

		if (!password || !newPassword) {
			return formatFail(
				res,
				'Current password and new password are required',
				StatusCodes.BAD_REQUEST
			);
		}

		const user = await UserService.getUserById(id);
		if (!user) {
			return formatFail(res, 'User not found', StatusCodes.NOT_FOUND);
		}

		const isPasswordValid = await UserService.comparePassword(
			password,
			user.password
		);
		if (!isPasswordValid) {
			return formatFail(res, 'Invalid password', StatusCodes.UNAUTHORIZED);
		}

		const hashedPassword = await UserService.hashPassword(newPassword);
		const updatedUser = await UserService.updateUser(id, {
			password: hashedPassword,
		});
		if (!updatedUser) {
			return formatError(
				res,
				'Failed to change password',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Password changed successfully',
			{},
			StatusCodes.OK
		);
	});
	ResetPassword = catchAsync(async (req, res) => {
		const { email } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(res, 'Email is required', StatusCodes.BAD_REQUEST);
		}

		if (!email) {
			return formatFail(res, 'Email is required', StatusCodes.BAD_REQUEST);
		}

		const user = await UserService.getUserById(email);
		if (user === null || !user) {
			return formatFail(res, 'User not found', StatusCodes.NOT_FOUND);
		}

		const resetToken = await UserService.generateResetToken(user);
		if (!resetToken || resetToken === 'undefined') {
			return formatError(
				res,
				'Failed to generate reset token',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Reset token generated successfully',
			{ resetToken },
			StatusCodes.OK
		);
	});
	createAddress = catchAsync(async (req, res) => {
		const {
			user,
			fullName,
			phoneNumber,
			province,
			district,
			ward,
			street,
			isDefault,
			note,
		} = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Address data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		if (
			!user ||
			!fullName ||
			!phoneNumber ||
			!province ||
			!district ||
			!ward ||
			!street
		) {
			return formatFail(
				res,
				'All required fields must be provided!',
				StatusCodes.BAD_REQUEST
			);
		}

		const validationAddress = UserValidation.createAddress;
		const { error } = validationAddress.validate({
			user,
			fullName,
			phoneNumber,
			province,
			district,
			ward,
			street,
			isDefault,
			note,
		});

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const newAddress = await UserService.createAddress({
			user,
			fullName,
			phoneNumber,
			province,
			district,
			ward,
			street,
			isDefault,
			note,
		});

		if (!newAddress) {
			return formatError(
				res,
				'Failed to create address',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Address created successfully',
			{ data: newAddress },
			StatusCodes.CREATED
		);
	});
	deleteAddress = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input data
		if (!id || id === 'undefined') {
			return formatFail(
				res,
				'Address ID is required!',
				StatusCodes.BAD_REQUEST
			);
		}

		const validationAddress = UserValidation.deleteAddress;
		const { error } = validationAddress.validate({ id });

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const deleted = await UserService.deleteAddress(id);
		if (!deleted) {
			return formatFail(res, 'Address not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Address deleted successfully',
			{ data: deleted },
			StatusCodes.OK
		);
	});
	updateAddress = catchAsync(async (req, res) => {
		const { id } = req.params;
		const {
			fullName,
			phoneNumber,
			province,
			district,
			ward,
			street,
			isDefault,
			note,
		} = req.body;

		// Validate input data
		if (!id) {
			return formatFail(
				res,
				'Address ID is required!',
				StatusCodes.BAD_REQUEST
			);
		}

		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail(
				res,
				'Update data is required',
				StatusCodes.BAD_REQUEST
			);
		}

		const validationAddress = UserValidation.updateAddress;
		const { error } = validationAddress.validate({
			id,
			fullName,
			phoneNumber,
			province,
			district,
			ward,
			street,
			isDefault,
			note,
		});

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const updateData = {};
		if (fullName !== undefined) updateData.fullName = fullName;
		if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
		if (province !== undefined) updateData.province = province;
		if (district !== undefined) updateData.district = district;
		if (ward !== undefined) updateData.ward = ward;
		if (street !== undefined) updateData.street = street;
		if (isDefault !== undefined) updateData.isDefault = isDefault;
		if (note !== undefined) updateData.note = note;

		const updatedAddress = await UserService.updateAddress(id, updateData);
		if (!updatedAddress) {
			return formatFail(
				res,
				'Address not found or update failed',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Address updated successfully',
			{ data: updatedAddress },
			StatusCodes.OK
		);
	});
	getAllAddresses = catchAsync(async (req, res) => {
		const addresses = await UserService.getAllAddresses();
		if (!addresses || addresses.length === 0) {
			return formatFail(res, 'No addresses found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Addresses retrieved successfully',
			{ data: addresses },
			StatusCodes.OK
		);
	});
	getAddressById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input data
		if (!id || id === 'undefined') {
			return formatFail(
				res,
				'Address ID is required!',
				StatusCodes.BAD_REQUEST
			);
		}

		const validationAddress = UserValidation.getAddressById;
		const { error } = validationAddress.validate({ id });

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const address = await UserService.getAddressById(id);
		if (!address) {
			return formatFail(res, 'Address not found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Address retrieved successfully',
			{ data: address },
			StatusCodes.OK
		);
	});
	getAddressesByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validate input data
		if (!userId || userId === 'undefined') {
			return formatFail(res, 'User ID is required!', StatusCodes.BAD_REQUEST);
		}

		const validationAddress = UserValidation.getAddressesByUser;
		const { error } = validationAddress.validate({ userId });

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const addresses = await UserService.getAddressesByUser(userId);
		if (!addresses || addresses.length === 0) {
			return formatFail(
				res,
				'No addresses found for this user',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'User addresses retrieved successfully',
			{ data: addresses },
			StatusCodes.OK
		);
	});
	getDefaultAddressByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validate input data
		if (!userId || userId === 'undefined') {
			return formatFail(res, 'User ID is required!', StatusCodes.BAD_REQUEST);
		}

		const address = await UserService.getDefaultAddressByUser(userId);
		if (!address) {
			return formatFail(
				res,
				'Default address not found for this user',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Default address retrieved successfully',
			{ data: address },
			StatusCodes.OK
		);
	});
	getAddressesPaginated = catchAsync(async (req, res) => {
		const { page = 1, limit = 10, search = '', userId } = req.query;

		const validationAddress = UserValidation.getAddressesPaginated;
		const { error } = validationAddress.validate({
			page: Number(page),
			limit: Number(limit),
			search,
			userId,
		});

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const result = await UserService.getAddressesPaginated({
			page: Number(page),
			limit: Number(limit),
			search,
			userId,
		});

		if (!result || !result.data || result.data.length === 0) {
			return formatFail(res, 'No addresses found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess(
			res,
			'Addresses retrieved successfully',
			result,
			StatusCodes.OK
		);
	});
	setDefaultAddress = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { userId } = req.body;

		// Validate input data
		if (!id || id === 'undefined') {
			return formatFail(
				res,
				'Address ID is required!',
				StatusCodes.BAD_REQUEST
			);
		}

		if (!userId) {
			return formatFail(res, 'User ID is required!', StatusCodes.BAD_REQUEST);
		}

		const validationAddress = UserValidation.setDefaultAddress;
		const { error } = validationAddress.validate({ id, userId });

		if (error) {
			return formatFail(res, error.details[0].message, StatusCodes.BAD_REQUEST);
		}

		const address = await UserService.setDefaultAddress(id, userId);
		if (!address) {
			return formatFail(
				res,
				'Address not found or update failed',
				StatusCodes.NOT_FOUND
			);
		}

		return formatSuccess(
			res,
			'Default address set successfully',
			{ data: address },
			StatusCodes.OK
		);
	});
	getAddressesCountByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		// Validate input data
		if (!userId || userId === 'undefined') {
			return formatFail(res, 'User ID is required!', StatusCodes.BAD_REQUEST);
		}

		const count = await UserService.getAddressesCountByUser(userId);
		if (count === null || count === undefined) {
			return formatError(
				res,
				'Failed to get address count',
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}

		return formatSuccess(
			res,
			'Address count retrieved successfully',
			{ data: { count } },
			StatusCodes.OK
		);
	});
}

export default new UserController();
