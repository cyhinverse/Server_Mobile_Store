import { Types } from 'mongoose';
import BaseRepository from '../../core/repository/base.repository.js';
import User from './user.model.js';
import { getPaginationMeta } from '../../shared/response/pagination.js';

class UserRepository extends BaseRepository {
	constructor() {
		super(User);
	}

	/**
	 * Find users with pagination and filters
	 */
	async findWithPagination({ page = 1, limit = 10, search = '', role = '' }) {
		page = Number(page);
		limit = Number(limit);

		const skip = (page - 1) * limit;
		const filter = {};

		if (search) {
			filter.$or = [
				{ fullName: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ phoneNumber: { $regex: search, $options: 'i' } },
			];
		}

		if (role) {
			filter.roles = role;
		}

		const [users, totalItems] = await Promise.all([
			this.model
				.find(filter)
				.select('-password -refreshToken')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			this.model.countDocuments(filter),
		]);

		const pagination = getPaginationMeta(page, limit, totalItems);

		const result = {
			users,
			...pagination,
		};

		return result;
	}

	/**
	 * Find user by email
	 */
	async findByEmail(email) {
		return await this.model.findOne({ email }).lean();
	}

	/**
	 * Find user by email with password (for authentication)
	 */
	async findByEmailWithPassword(email) {
		return await this.model.findOne({ email }).select('+password');
	}

	/**
	 * Update user password
	 */
	async updatePassword(userId, hashedPassword) {
		return await this.model
			.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })
			.select('-password');
	}

	/**
	 * Get user addresses
	 */
	async getAddressesByUserId(userId) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		const user = await this.model.findById(userId).select('address').lean();
		return user?.address || [];
	}

	/**
	 * Get specific address by ID
	 */
	async getAddressById(userId, addressId) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const user = await this.model
			.findOne({ _id: userId, 'address._id': addressId }, { 'address.$': 1 })
			.lean();

		return user?.address?.[0] || null;
	}

	/**
	 * Add address to user
	 */
	async addAddress(userId, addressData) {
		const addressWithId = {
			...addressData,
			_id: new Types.ObjectId(),
		};

		return await this.model
			.findByIdAndUpdate(
				userId,
				{ $push: { address: addressWithId } },
				{ new: true, runValidators: true }
			)
			.select('address');
	}

	/**
	 * Update user address
	 */
	async updateAddress(userId, addressId, addressData) {
		const updateFields = {};
		Object.keys(addressData).forEach((key) => {
			updateFields[`address.$.${key}`] = addressData[key];
		});

		return await this.model
			.findOneAndUpdate(
				{ _id: userId, 'address._id': addressId },
				{ $set: updateFields },
				{ new: true, runValidators: true }
			)
			.select('address');
	}

	/**
	 * Delete user address
	 */
	async deleteAddress(userId, addressId) {
		return await this.model
			.findByIdAndUpdate(
				userId,
				{ $pull: { address: { _id: addressId } } },
				{ new: true }
			)
			.select('address');
	}

	/**
	 * Set default address
	 */
	async setDefaultAddress(userId, addressId) {
		// First, unset all default addresses
		await this.model.findByIdAndUpdate(userId, {
			$set: { 'address.$[].isDefault': false },
		});

		// Then set the specified address as default
		return await this.model
			.findOneAndUpdate(
				{ _id: userId, 'address._id': addressId },
				{ $set: { 'address.$.isDefault': true } },
				{ new: true }
			)
			.select('address');
	}

	/**
	 * Get default address
	 */
	async getDefaultAddress(userId) {
		const user = await this.model.findById(userId).select('address').lean();
		return user?.address?.find((addr) => addr.isDefault) || null;
	}

	/**
	 * Get all addresses with pagination
	 */
	async getAllAddressesPaginated({ page = 1, limit = 10 }) {
		const skip = (page - 1) * limit;

		const pipeline = [
			{ $unwind: '$address' },
			{ $skip: skip },
			{ $limit: limit },
			{
				$project: {
					userId: '$_id',
					userName: '$fullName',
					userEmail: '$email',
					address: '$address',
				},
			},
		];

		const [addresses, totalCount] = await Promise.all([
			this.model.aggregate(pipeline),
			this.model.aggregate([{ $unwind: '$address' }, { $count: 'total' }]),
		]);

		const totalItems = totalCount[0]?.total || 0;
		const pagination = getPaginationMeta(page, limit, totalItems);

		return {
			addresses,
			...pagination,
		};
	}

	/**
	 * Count addresses by user
	 */
	async countAddressesByUser(userId) {
		const user = await this.model.findById(userId).select('address').lean();
		return user?.address?.length || 0;
	}

	/**
	 * Get user statistics
	 */
	async getUserStats() {
		const [totalUsers, usersByRole, recentUsers] = await Promise.all([
			this.model.countDocuments(),
			this.model.aggregate([
				{
					$group: {
						_id: '$roles',
						count: { $sum: 1 },
					},
				},
			]),
			this.model.countDocuments({
				createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
			}),
		]);

		return {
			totalUsers,
			usersByRole,
			recentUsers,
		};
	}
}

export default new UserRepository();
