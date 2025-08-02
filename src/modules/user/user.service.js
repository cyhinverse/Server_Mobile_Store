import { Types } from 'mongoose';
import BaseService from '../../core/service/base.service.js';
import userRepository from './user.repository.js';
import { hashPassword } from '../../utils/password.util.js';

class UserService extends BaseService {
	constructor() {
		super(userRepository);
		this.userRepo = userRepository;
	}

	/**
	 * Create new user (Admin function)
	 */
	createUser = async (data) => {
		const { fullName, email, password, roles } = data;

		// Business validation
		if (!fullName || !email || !password) {
			throw new Error('Full name, email, and password are required');
		}

		// Check if email already exists
		const existingUser = await this.userRepo.findByEmail(email);
		if (existingUser) {
			throw new Error('Email already exists');
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		const newUser = {
			fullName,
			email,
			password: hashedPassword,
			roles: roles || 'user',
		};

		const createdUser = await this.userRepo.create(newUser);
		// Remove password from response
		const { password: _, ...userWithoutPassword } = createdUser.toObject();
		return userWithoutPassword;
	};

	/**
	 * Get all users with pagination
	 */
	getUsersPaginated = async ({ page, limit, search, role }) => {
		const data = await this.userRepo.findWithPagination({
			page,
			limit,
			search,
			role,
		});

		return data;
	};

	/**
	 * Get user by ID
	 */
	getUserById = async (userId) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		return user;
	};

	/**
	 * Update user
	 */
	updateUser = async (userId, dataUser) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// If password is being updated, hash it
		if (dataUser.password) {
			dataUser.password = await hashPassword(dataUser.password);
		}

		return await this.userRepo.update(userId, dataUser);
	};

	/**
	 * Delete user
	 */
	deleteUser = async (userId) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		return await this.userRepo.delete(userId);
	};

	/**
	 * Add address to user
	 */
	addAddress = async (userId, addressData) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const requiredFields = [
			'fullName',
			'phoneNumber',
			'province',
			'district',
			'ward',
			'street',
		];
		const missingFields = requiredFields.filter((field) => !addressData[field]);

		if (missingFields.length > 0) {
			throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		return await this.userRepo.addAddress(userId, addressData);
	};

	/**
	 * Update user address
	 */
	updateAddress = async (userId, addressId, addressData) => {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const existingAddress = await this.userRepo.getAddressById(
			userId,
			addressId
		);
		if (!existingAddress) {
			throw new Error('Address not found');
		}

		return await this.userRepo.updateAddress(userId, addressId, addressData);
	};

	/**
	 * Delete user address
	 */
	deleteAddress = async (userId, addressId) => {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const existingAddress = await this.userRepo.getAddressById(
			userId,
			addressId
		);
		if (!existingAddress) {
			throw new Error('Address not found');
		}

		return await this.userRepo.deleteAddress(userId, addressId);
	};

	/**
	 * Set default address
	 */
	setDefaultAddress = async (userId, addressId) => {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const existingAddress = await this.userRepo.getAddressById(
			userId,
			addressId
		);
		if (!existingAddress) {
			throw new Error('Address not found');
		}

		return await this.userRepo.setDefaultAddress(userId, addressId);
	};

	/**
	 * Get user addresses
	 */
	getAddressesByUser = async (userId) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		return await this.userRepo.getAddressesByUserId(userId);
	};

	/**
	 * Get address by ID
	 */
	getAddressById = async (userId, addressId) => {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const address = await this.userRepo.getAddressById(userId, addressId);
		if (!address) {
			throw new Error('Address not found');
		}

		return address;
	};

	/**
	 * Get default address
	 */
	getDefaultAddress = async (userId) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		return await this.userRepo.getDefaultAddress(userId);
	};

	/**
	 * Get all addresses with pagination (Admin function)
	 */
	getAllAddressesPaginated = async ({ page, limit }) => {
		return await this.userRepo.getAllAddressesPaginated({ page, limit });
	};

	/**
	 * Count addresses by user
	 */
	countAddressesByUser = async (userId) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		return await this.userRepo.countAddressesByUser(userId);
	};

	/**
	 * Get user statistics (Admin function)
	 */
	getUserStats = async () => {
		return await this.userRepo.getUserStats();
	};
}

export default new UserService();
