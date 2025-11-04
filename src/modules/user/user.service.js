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

	/**
	 * Update user profile (phone, dayOfBirth, isStudent, isTeacher)
	 */
	updateProfile = async (userId, profileData) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Only allow specific profile fields
		const allowedFields = [
			'phoneNumber',
			'dayOfBirth',
			'isStudent',
			'isTeacher',
			'fullName',
		];
		const updateData = {};

		allowedFields.forEach((field) => {
			if (profileData[field] !== undefined) {
				updateData[field] = profileData[field];
			}
		});

		// Validate phone number if provided
		if (updateData.phoneNumber) {
			const existingUser = await this.userRepo.findByPhoneNumber(
				updateData.phoneNumber
			);
			if (existingUser && existingUser._id.toString() !== userId) {
				throw new Error('Phone number already in use');
			}
		}

		// Validate dayOfBirth if provided
		if (updateData.dayOfBirth) {
			const birthDate = new Date(updateData.dayOfBirth);
			const today = new Date();
			if (birthDate > today) {
				throw new Error('Date of birth cannot be in the future');
			}
		}

		return await this.userRepo.update(userId, updateData);
	};

	/**
	 * Resend verification code
	 */
	resendVerificationCode = async (userId) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		if (user.verifyEmail) {
			throw new Error('Email already verified');
		}

		// Generate new code
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

		await this.userRepo.update(userId, {
			codeVerify: code,
			codeExpiresAt: expiresAt,
		});

		// TODO: Send email with code using nodemailer
		// await sendVerificationEmail(user.email, code);

		return { code, expiresAt }; // Remove code from response in production
	};

	/**
	 * Generate QR code for 2FA
	 */
	generateQRCode = async (userId) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Generate QR code (base64 string or URL)
		const qrCode = `QR_${userId}_${Date.now()}`; // Simplified, use actual QR library in production
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

		await this.userRepo.update(userId, {
			qr_code: qrCode,
			qrExpiresAt: expiresAt,
		});

		return { qr_code: qrCode, expiresAt };
	};

	/**
	 * Verify QR code for 2FA
	 */
	verifyQRCode = async (userId, code) => {
		if (!Types.ObjectId.isValid(userId)) {
			throw new Error('Invalid user ID');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		if (!user.qr_code || user.qr_code !== code) {
			throw new Error('Invalid QR code');
		}

		if (user.qrExpiresAt && new Date() > user.qrExpiresAt) {
			throw new Error('QR code expired');
		}

		// Clear QR code after verification
		await this.userRepo.update(userId, {
			qr_code: '',
			qrExpiresAt: null,
		});

		return { verified: true };
	};

	/**
	 * Get students (Admin/Teacher function)
	 */
	getStudents = async ({ page, limit }) => {
		return await this.userRepo.findStudents({ page, limit });
	};

	/**
	 * Get teachers (Admin function)
	 */
	getTeachers = async ({ page, limit }) => {
		return await this.userRepo.findTeachers({ page, limit });
	};
}

export default new UserService();
