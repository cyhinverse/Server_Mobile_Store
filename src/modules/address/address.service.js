import { catchAsync } from '../../configs/catchAsync.js';
import addressModel from './address.model.js';

class AddressService {
	constructor() {
		if (AddressService.instance) return AddressService.instance;
		this.model = addressModel;
		AddressService.instance = this;
	}

	createAddress = catchAsync(async (data) => {
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
		} = data;

		if (
			!user ||
			!fullName ||
			!phoneNumber ||
			!province ||
			!district ||
			!ward ||
			!street
		) {
			throw new Error('All required fields must be provided');
		}

		// If this is set as default, make sure all other addresses for this user are not default
		if (isDefault) {
			await this.model.updateMany({ user }, { isDefault: false });
		}

		// If this is the first address for the user, make it default
		const existingAddresses = await this.model.find({ user });
		const shouldBeDefault = isDefault || existingAddresses.length === 0;

		const address = new this.model({
			user,
			fullName,
			phoneNumber,
			province,
			district,
			ward,
			street,
			isDefault: shouldBeDefault,
			note: note || '',
		});

		return await address.save();
	});

	getAllAddresses = catchAsync(async () => {
		return await this.model
			.find()
			.populate('user', 'fullName email')
			.sort({ createdAt: -1 });
	});

	getAddressById = catchAsync(async (id) => {
		if (!id) throw new Error('Address ID is required');
		const address = await this.model
			.findById(id)
			.populate('user', 'fullName email');
		if (!address) throw new Error('Address not found');
		return address;
	});

	getAddressesByUser = catchAsync(async (userId) => {
		if (!userId) throw new Error('User ID is required');
		return await this.model
			.find({ user: userId })
			.sort({ isDefault: -1, createdAt: -1 });
	});

	getDefaultAddressByUser = catchAsync(async (userId) => {
		if (!userId) throw new Error('User ID is required');
		const address = await this.model.findOne({ user: userId, isDefault: true });
		if (!address) throw new Error('No default address found for this user');
		return address;
	});

	getAddressesPaginated = catchAsync(
		async ({ page = 1, limit = 10, search = '', userId }) => {
			const query = {};

			if (search) {
				query.$or = [
					{ fullName: { $regex: search, $options: 'i' } },
					{ phoneNumber: { $regex: search, $options: 'i' } },
					{ province: { $regex: search, $options: 'i' } },
					{ district: { $regex: search, $options: 'i' } },
					{ ward: { $regex: search, $options: 'i' } },
					{ street: { $regex: search, $options: 'i' } },
				];
			}

			if (userId) {
				query.user = userId;
			}

			const addresses = await this.model
				.find(query)
				.populate('user', 'fullName email')
				.skip((page - 1) * limit)
				.limit(limit)
				.sort({ createdAt: -1 });

			const total = await this.model.countDocuments(query);
			return {
				data: addresses,
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit),
			};
		}
	);

	updateAddress = catchAsync(async (id, data) => {
		if (!id || !data) {
			throw new Error('Address ID and update data are required');
		}

		// If setting this address as default, make all others non-default for this user
		if (data.isDefault) {
			const currentAddress = await this.model.findById(id);
			if (!currentAddress) throw new Error('Address not found');

			await this.model.updateMany(
				{ user: currentAddress.user, _id: { $ne: id } },
				{ isDefault: false }
			);
		}

		const address = await this.model
			.findByIdAndUpdate(id, data, {
				new: true,
				runValidators: true,
			})
			.populate('user', 'fullName email');

		if (!address) throw new Error('Address not found');
		return address;
	});

	deleteAddress = catchAsync(async (id) => {
		if (!id) throw new Error('Address ID is required');

		const address = await this.model.findById(id);
		if (!address) throw new Error('Address not found');

		// If deleting the default address, set another address as default
		if (address.isDefault) {
			const otherAddress = await this.model.findOne({
				user: address.user,
				_id: { $ne: id },
			});
			if (otherAddress) {
				otherAddress.isDefault = true;
				await otherAddress.save();
			}
		}

		const deleted = await this.model.findByIdAndDelete(id);
		return deleted;
	});

	setDefaultAddress = catchAsync(async (id, userId) => {
		if (!id || !userId) throw new Error('Address ID and User ID are required');

		// Verify the address belongs to the user
		const address = await this.model.findOne({ _id: id, user: userId });
		if (!address)
			throw new Error('Address not found or does not belong to this user');

		// Set all addresses for this user as non-default
		await this.model.updateMany({ user: userId }, { isDefault: false });

		// Set the specified address as default
		address.isDefault = true;
		return await address.save();
	});

	getAddressesCountByUser = catchAsync(async (userId) => {
		if (!userId) throw new Error('User ID is required');
		return await this.model.countDocuments({ user: userId });
	});
}

export default new AddressService();
