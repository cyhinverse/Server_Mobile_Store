import { Types } from 'mongoose';
import BaseService from '../../core/service/base.service.js';
import UserRepository from './user.repository.js';
class UserService extends BaseService {
	constructor() {
		super(UserRepository);
		if (UserService.instance) return UserService.instance;
		UserService.instance = this;
		this.userRepo = UserRepository;
	}
	async createUser(data) {
		if (!data || Object.keys(data).length === 0) {
			throw new Error('User data is required');
		}
		const { fullName, email, password, roles } = data;
		if (!fullName || !email || !password) {
			throw new Error('Full name, email, and password are required');
		}
		const existingUser = await this.userRepo.findOne({ email });
		if (existingUser) {
			throw new Error('Email already exists');
		}

		const newUser = {
			fullName,
			email,
			password,
			roles: roles || 'user',
		};
		const createdUser = await this.userRepo.create(newUser);
		return createdUser;
	}
	async updateUser(userId, dataUser) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		const user = await this.userRepo.findById(userId);

		if (!user) throw new Error('User not found');
		const updatedUser = await this.userRepo.update(userId, dataUser);
		return updatedUser;
	}
	async deleteUser(userId) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		const user = await this.userRepo.findById(userId);
		if (!user) throw new Error('User not found');
		return await this.userRepo.deleteOne({ _id: userId });
	}
	async addAddress(userId, addressData) {
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

		const user = await this.userRepo.findById(userId);
		if (!user) throw new Error('User not found');

		if (addressData.isDefault) {
			user.address.forEach((addr) => (addr.isDefault = false));
		} else {
			const defaultAddress = user.address.find((addr) => addr.isDefault);
			if (!defaultAddress) {
				addressData.isDefault = true;
			}
		}

		const newAddress = {
			...addressData,
			user: userId,
			_id: new Types.ObjectId(),
			isDefault: addressData.isDefault,
			createdAt: new Date(),
		};

		user.address.push(newAddress);
		await this.userRepo.save(user);
		return newAddress;
	}
	async getAddresses(userId) {
		const user = await this.userRepo.getAddressesByUserId(userId);
		if (!user) throw new Error('User not found');

		return user.address.sort(
			(a, b) => b.isDefault - a.isDefault || b.createdAt - a.createdAt
		);
	}
	async getAddressById(userId, addressId) {
		const user = await this.userRepo.getAddressById(userId, addressId);
		if (!user?.address?.length) throw new Error('Address not found');

		return user.address[0];
	}
	async updateAddress(userId, addressId, updateData) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid user ID or address ID');
		}
		const user = await this.userRepo.findById(userId);
		if (!user) throw new Error('User not found');

		const address = user.address.find((addr) => addr._id.equals(addressId));
		if (!address) throw new Error('Address not found');

		if (updateData.isDefault === true) {
			user.address.forEach((addr) => {
				addr.isDefault = addr._id.equals(addressId);
			});
		}

		Object.assign(address, updateData);

		const hasDefault = user.address.some((addr) => addr.isDefault);
		if (!hasDefault && user.address.length > 0) {
			user.address[0].isDefault = true;
		}

		await this.userRepo.save(user);
		return address;
	}

	async deleteAddress(userId, addressId) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) throw new Error('User not found');

		const address = user.address.find((addr) => addr._id.equals(addressId));
		if (!address) throw new Error('Address not found');

		if (address.isDefault && user.address.length > 1) {
			const newDefault = user.address.find((a) => !a._id.equals(addressId));
			if (newDefault) newDefault.isDefault = true;
		}

		user.address.pull(addressId);
		await this.userRepo.save(user);
		return address;
	}
	async setDefaultAddress(userId, addressId) {
		if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
			throw new Error('Invalid IDs');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) throw new Error('User not found');

		const address = user.address.find(
			(addr) => addr._id.toString() === addressId.toString()
		);
		if (!address) throw new Error('Address not found');

		user.address.forEach((addr) => {
			addr.isDefault = addr._id.toString() === addressId.toString();
		});

		await this.userRepo.save(user);
		return address;
	}
	async hashPassword(password) {
		if (!password) throw new Error('Password is required');
		return await this.userRepo.hashPassword(password);
	}
	async comparePassword(password, hash) {
		return await this.userRepo.comparePassword(password, hash);
	}
	async findEmail(email) {
		if (!email) throw new Error('Email is required');
		const user = await this.userRepo.findOne({ email });
		if (!user) throw new Error('User not found');
		return user;
	}
	async getAddressesByUser(userId) {
		if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
		const user = await this.userRepo.getAddressesByUserId(userId);
		if (!user) throw new Error('User not found');
		return user.address;
	}
}

export default new UserService();
