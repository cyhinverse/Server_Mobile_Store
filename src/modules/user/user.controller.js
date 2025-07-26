import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import UserService from './user.service.js';
import UserValidation from './user.validation.js';
import {
	formatError,
	formatFail,
	formatSuccess,
} from '../../shared/response/responseFormatter.js';
import BaseService from '../../core/service/base.service.js';
import { comparePassword, hashPassword } from '../../utils/password.util.js';
import { Token } from '../../utils/token.js';

class UserController extends BaseService {
	createUser = catchAsync(async (req, res) => {
		const { fullName, email, password, roles } = req.body;
		console.log('req.body', req.body);

		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail({
				res,
				message: 'User data is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		if (!fullName || !email || !password || !roles) {
			return formatFail({
				res,
				message: 'All fields are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const { error } = UserValidation.createUserValidation.validate(req.body);

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const hashedPassword = await hashPassword(password);
		const userData = {
			fullName,
			email,
			password: hashedPassword,
			roles,
		};

		const newUser = await UserService.createUser(userData);
		if (!newUser) {
			return formatError({
				res,
				message: 'Failed to create user',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return formatSuccess({
			res,
			message: 'User created successfully',
			data: { user: newUser },
			code: StatusCodes.CREATED,
		});
	});
	updateUser = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { dataUser } = req.body;

		if (!id) {
			return formatFail({
				res,
				message: 'User ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail({
				res,
				message: 'Update data is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const updatedData = await UserService.updateUser(id, dataUser);
		if (!updatedData) {
			return formatFail({
				res,
				message: 'User not found or update failed',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			message: 'User updated successfully',
			data: { user: updatedData },
			code: StatusCodes.OK,
		});
	});
	deleteUser = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input data
		if (!id) {
			return formatFail({
				res,
				message: 'User ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await UserService.findById(id);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		await UserService.deleteUser(id);

		return formatSuccess({
			res,
			message: 'User deleted successfully',
			code: StatusCodes.OK,
		});
	});
	getUserById = catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate input data
		if (!id) {
			return formatFail({
				res,
				message: 'User ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await UserService.findById(id);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			message: 'User found successfully',
			data: { user },
			code: StatusCodes.OK,
		});
	});
	getAllUser = catchAsync(async (req, res) => {
		const users = await UserService.findAll();
		if (!users || users.length === 0) {
			return formatFail(res, 'No users found', StatusCodes.NOT_FOUND);
		}

		return formatSuccess({
			res,
			message: 'Users found successfully',
			data: { users },
			code: StatusCodes.OK,
		});
	});
	changePassword = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { password, newPassword } = req.body;

		// Validate input data
		if (!id) {
			return formatFail({
				res,
				message: 'User ID is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		if (!password || !newPassword) {
			return formatFail({
				res,
				message: 'Current password and new password are required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await UserService.findById(id);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return formatFail({
				res,
				message: 'Invalid password',
				code: StatusCodes.UNAUTHORIZED,
			});
		}

		const hashedPassword = await hashPassword(newPassword);
		if (!hashedPassword) {
			return formatError({
				res,
				message: 'Failed to hash new password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		const updatedUser = await UserService.updateUser(id, {
			password: hashedPassword,
		});
		if (!updatedUser) {
			return formatError({
				res,
				message: 'Failed to change password',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return formatSuccess({
			res,
			message: 'Password changed successfully',
			data: {},
			code: StatusCodes.OK,
		});
	});
	ResetPassword = catchAsync(async (req, res) => {
		const { email } = req.body;

		// Validate input data
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail({
				res,
				message: 'Email is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		if (!email) {
			return formatFail({
				res,
				message: 'Email is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const user = await UserService.findEmail(email);
		if (!user) {
			return formatFail({
				res,
				message: 'User not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		const resetToken = await Token.generateResetToken(user);
		if (!resetToken || resetToken === 'undefined') {
			return formatError({
				res,
				message: 'Failed to generate reset token',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return formatSuccess({
			res,
			message: 'Reset token generated successfully',
			data: { resetToken },
			code: StatusCodes.OK,
		});
	});
	createAddress = catchAsync(async (req, res) => {
		const { _id } = req.user;

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
		if (!req.body || Object.keys(req.body).length === 0) {
			return formatFail({
				res,
				message: 'Address data is required',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		if (
			!fullName ||
			!phoneNumber ||
			!province ||
			!district ||
			!ward ||
			!street
		) {
			return formatFail({
				res,
				message: 'All required fields must be provided!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const validationAddress = UserValidation.createAddress;
		const { error } = validationAddress.validate({
			user: _id,
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
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const newAddress = await UserService.addAddress(_id, {
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
			return formatError({
				res,
				message: 'Failed to create address',
				code: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return formatSuccess({
			res,
			message: 'Address created successfully',
			data: { address: newAddress },
			code: StatusCodes.CREATED,
		});
	});
	deleteAddress = catchAsync(async (req, res) => {
		const userId = req.user._id;
		const { idAddre } = req.body;

		if (!idAddre || idAddre === 'undefined') {
			return formatFail({
				res,
				message: 'Address ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}

		// Validate dữ liệu
		const { error } = UserValidation.deleteAddress.validate({
			_id: userId,
			idAddre,
		});

		if (error) {
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		// Gọi service
		const deletedAddress = await UserService.deleteAddress(userId, idAddre);

		if (!deletedAddress) {
			return formatFail({
				res,
				message: 'Address not found',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			message: 'Address deleted successfully',
			data: { address: deletedAddress },
			code: StatusCodes.OK,
		});
	});

	updateAddress = catchAsync(async (req, res) => {
		const userId = req.user._id;
		const {
			idAddre,
			fullName,
			phoneNumber,
			province,
			district,
			ward,
			street,
			isDefault,
			note,
		} = req.body;

		if (!idAddre) {
			return formatFail({
				res,
				message: 'Address ID is required!',
				code: StatusCodes.BAD_REQUEST,
			});
		}
		const { error } = UserValidation.updateAddress.validate({
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
			return formatFail({
				res,
				message: error.details[0].message,
				code: StatusCodes.BAD_REQUEST,
			});
		}

		const updateData = {
			...(fullName && { fullName }),
			...(phoneNumber && { phoneNumber }),
			...(province && { province }),
			...(district && { district }),
			...(ward && { ward }),
			...(street && { street }),
			...(note && { note }),
			...(typeof isDefault === 'boolean' && { isDefault }),
		};

		const updatedAddress = await UserService.updateAddress(
			userId,
			idAddre,
			updateData
		);

		if (!updatedAddress) {
			return formatFail({
				res,
				message: 'Address not found or update failed',
				code: StatusCodes.NOT_FOUND,
			});
		}

		return formatSuccess({
			res,
			message: 'Address updated successfully',
			data: { address: updatedAddress },
			code: StatusCodes.OK,
		});
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
