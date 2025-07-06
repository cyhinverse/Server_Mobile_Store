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
}

export default new UserController();
