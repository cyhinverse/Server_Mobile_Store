import { Types } from 'mongoose';
import User from './user.model.js';
import bcrypt from 'bcrypt';

class UserService {
	static async checkUserExists(email) {
		if (!email) throw new Error('Email is required');
		return await User.findOne({ email }).lean();
	}
	static async updatePasswordForUser(userId, newPassword) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		const hashedPassword = await UserService.hashPassword(newPassword);
		return await User.findByIdAndUpdate(
			userId,
			{ password: hashedPassword },
			{ new: true }
		);
	}

	static async createUser(userData) {
		if (!userData?.email || !userData?.phoneNumber) {
			throw new Error('Email and phone number are required');
		}
		return await User.create(userData);
	}

	static async hashPassword(password) {
		if (!password) throw new Error('Password is required');
		return await bcrypt.hash(password, 10);
	}

	static async comparePassword(password, hashedPassword) {
		if (!password || !hashedPassword)
			throw new Error('Both passwords are required');
		return await bcrypt.compare(password, hashedPassword);
	}

	static async getUserById(userId) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		return await User.findById(userId);
	}

	static async updateUser(userId, updateData) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		return await User.findByIdAndUpdate(userId, updateData, {
			new: true,
			runValidators: true,
		}).lean();
	}

	static async addAddress(userId, addressData) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');

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

		const user = await User.findById(userId);
		if (!user) throw new Error('User not found');

		if (addressData.isDefault) {
			user.addresses.forEach((addr) => {
				addr.isDefault = false;
			});
		}

		const newAddress = {
			...addressData,
			_id: new Types.ObjectId(),
			isDefault: addressData.isDefault || user.addresses.length === 0,
			createdAt: new Date(),
		};

		user.addresses.push(newAddress);
		await user.save();
		return newAddress;
	}

	static async getAddresses(userId) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		const user = await User.findById(userId).select('addresses').lean();
		if (!user) throw new Error('User not found');

		return user.addresses.sort(
			(a, b) => b.isDefault - a.isDefault || b.createdAt - a.createdAt
		);
	}

	static async getAddressById(userId, addressId) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const user = await User.findOne(
			{ _id: userId, 'addresses._id': addressId },
			{ 'addresses.$': 1 }
		).lean();

		if (!user?.addresses?.length) throw new Error('Address not found');
		return user.addresses[0];
	}

	static async updateAddress(userId, addressId, updateData) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const user = await User.findById(userId);
		if (!user) throw new Error('User not found');

		const address = user.addresses.id(addressId);
		if (!address) throw new Error('Address not found');

		if (updateData.isDefault) {
			user.addresses.forEach((addr) => {
				addr.isDefault = addr._id.equals(addressId);
			});
		}

		Object.assign(address, updateData);
		await user.save();
		return address;
	}

	static async deleteAddress(userId, addressId) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const user = await User.findById(userId);
		if (!user) throw new Error('User not found');

		const address = user.addresses.id(addressId);
		if (!address) throw new Error('Address not found');

		if (address.isDefault && user.addresses.length > 1) {
			const newDefault = user.addresses.find((a) => !a._id.equals(addressId));
			if (newDefault) newDefault.isDefault = true;
		}

		user.address.pull(addressId);
		await user.save();
		return address;
	}

	static async setDefaultAddress(userId, addressId) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const user = await User.findById(userId);
		if (!user) throw new Error('User not found');

		const address = user.address.id(addressId);
		if (!address) throw new Error('Address not found');

		user.addresses.forEach((addr) => {
			addr.isDefault = addr._id.equals(addressId);
		});

		await user.save();
		return address;
	}
	static async getUserByEmail(email) {
		if (!email) throw new Error('Email is required');
		return await User.findOne({
			email,
		});
	}
}

export default UserService;
