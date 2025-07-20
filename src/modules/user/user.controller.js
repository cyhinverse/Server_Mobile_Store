import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import UserService from './user.service.js';
import UserValidation from './user.validation.js';
import chalk from 'chalk';

class UserController {
	createUser = catchAsync(async (req, res) => {
		const { fullName, email, password, roles } = req.body;
		if (!fullName || !email || !password || !roles) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'All fields are required',
			});
		}
		const { error } = UserValidation.createUserValidation.validate(req.body);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}
		const user = await UserService.createUser({
			fullName,
			email,
			password,
			roles,
		});
		if (!user) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to create user',
			});
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
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to create user',
			});
		}
		return res.status(StatusCodes.CREATED).json({
			message: 'User created successfully',
			user: newUser,
		});
	});
	updateUser = catchAsync(async (req, res) => {
		const { id } = req.params;
		const dataUser = req.body;
		const updatedData = UserService.updateUser(id, dataUser);
		if (!updatedData) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'User updated successfully',
			user: updatedData,
		});
	});
	deleteUser = catchAsync(async (req, res) => {
		const { id } = req.params;
		const user = await UserService.getUserById(id);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}
		await UserService.deleteUser(id);
		return res.status(StatusCodes.OK).json({
			message: 'User deleted successfully',
		});
	});
	getUserById = catchAsync(async (req, res) => {
		const { id } = req.params;
		const user = await UserService.getUserById(id);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'User found successfully',
			user,
		});
	});
	getAllUser = catchAsync(async (req, res) => {
		const users = await UserService.getAllUser();
		if (!users) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'No users found',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Users found successfully',
			users,
		});
	});
	changePassword = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { password, newPassword } = req.body;

		const user = await UserService.getUserById(id);
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: 'User not found',
			});
		}
		const isPasswordValid = await UserService.comparePassword(
			password,
			user.password
		);
		if (!isPasswordValid) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Invalid password',
			});
		}
		const hashedPassword = await UserService.hashPassword(newPassword);
		const updatedUser = await UserService.updateUser(id, {
			password: hashedPassword,
		});
		if (!updatedUser) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to change password',
			});
		}
		return res.status(StatusCodes.OK).json({
			message: 'Password changed successfully',
		});
	});
	ResetPassword = catchAsync(async (req, res) => {
		const { email } = req.body;
		if (!email) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User not found',
			});
		}
		const user = await UserService.getUserById(email);
		if (user === null || !user) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: chalk.red('User not found'),
			});
		}
		const resetToken = await UserService.generateResetToken(user);
		if (!resetToken || resetToken === 'undefined') {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red('Failed to generate reset token'),
			});
		}
		return res.status(StatusCodes.OK).json({
			message: chalk.green('Reset token generated successfully'),
			resetToken,
		});
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

		if (
			!user ||
			!fullName ||
			!phoneNumber ||
			!province ||
			!district ||
			!ward ||
			!street
		) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'All required fields must be provided!',
			});
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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const newAddress = await this.UserService.createAddress({
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

			return res.status(StatusCodes.CREATED).json({
				message: 'Address created successfully',
				data: newAddress,
			});
		} catch (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.message,
			});
		}
	});

	deleteAddress = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Address ID is required!',
			});
		}

		const validationAddress = UserValidation.deleteAddress;
		const { error } = validationAddress.validate({ id });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const deleted = await this.UserService.deleteAddress(id);
			return res.status(StatusCodes.OK).json({
				message: 'Address deleted successfully',
				data: deleted,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
			});
		}
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

		if (!id) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Address ID is required!',
			});
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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const updateData = {};
			if (fullName !== undefined) updateData.fullName = fullName;
			if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
			if (province !== undefined) updateData.province = province;
			if (district !== undefined) updateData.district = district;
			if (ward !== undefined) updateData.ward = ward;
			if (street !== undefined) updateData.street = street;
			if (isDefault !== undefined) updateData.isDefault = isDefault;
			if (note !== undefined) updateData.note = note;

			const updatedAddress = await this.UserService.updateAddress(
				id,
				updateData
			);

			return res.status(StatusCodes.OK).json({
				message: 'Address updated successfully',
				data: updatedAddress,
			});
		} catch (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.message,
			});
		}
	});

	getAllAddresses = catchAsync(async (req, res) => {
		try {
			const addresses = await this.UserService.getAllAddresses();
			return res.status(StatusCodes.OK).json({
				message: 'Addresses retrieved successfully',
				data: addresses,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error.message,
			});
		}
	});

	getAddressById = catchAsync(async (req, res) => {
		const { id } = req.params;

		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Address ID is required!',
			});
		}

		const validationAddress = UserValidation.getAddressById;
		const { error } = validationAddress.validate({ id });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const address = await this.UserService.getAddressById(id);
			return res.status(StatusCodes.OK).json({
				message: 'Address retrieved successfully',
				data: address,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
			});
		}
	});

	getAddressesByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		if (!userId || userId === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID is required!',
			});
		}

		const validationAddress = UserValidation.getAddressesByUser;
		const { error } = validationAddress.validate({ userId });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const addresses = await this.UserService.getAddressesByUser(userId);
			return res.status(StatusCodes.OK).json({
				message: 'User addresses retrieved successfully',
				data: addresses,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
			});
		}
	});

	getDefaultAddressByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		if (!userId || userId === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID is required!',
			});
		}

		try {
			const address = await this.UserService.getDefaultAddressByUser(userId);
			return res.status(StatusCodes.OK).json({
				message: 'Default address retrieved successfully',
				data: address,
			});
		} catch (error) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: error.message,
			});
		}
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
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const result = await this.UserService.getAddressesPaginated({
				page: Number(page),
				limit: Number(limit),
				search,
				userId,
			});

			return res.status(StatusCodes.OK).json({
				message: 'Addresses retrieved successfully',
				...result,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error.message,
			});
		}
	});

	setDefaultAddress = catchAsync(async (req, res) => {
		const { id } = req.params;
		const { userId } = req.body;

		if (!id || id === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Address ID is required!',
			});
		}

		if (!userId) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID is required!',
			});
		}

		const validationAddress = UserValidation.setDefaultAddress;
		const { error } = validationAddress.validate({ id, userId });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const address = await this.UserService.setDefaultAddress(id, userId);
			return res.status(StatusCodes.OK).json({
				message: 'Default address set successfully',
				data: address,
			});
		} catch (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.message,
			});
		}
	});

	getAddressesCountByUser = catchAsync(async (req, res) => {
		const { userId } = req.params;

		if (!userId || userId === 'undefined') {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'User ID is required!',
			});
		}

		try {
			const count = await this.UserService.getAddressesCountByUser(userId);
			return res.status(StatusCodes.OK).json({
				message: 'Address count retrieved successfully',
				data: { count },
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error.message,
			});
		}
	});
}

export default new UserController();
