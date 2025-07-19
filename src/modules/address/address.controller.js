import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../configs/catchAsync.js';
import addressService from './address.service.js';
import { ValidationAddress } from './address.validation.js';

class AddressController {
	constructor() {
		this.addressService = addressService;
	}

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

		const validationAddress = ValidationAddress.createAddress;
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
			const newAddress = await this.addressService.createAddress({
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

		const validationAddress = ValidationAddress.deleteAddress;
		const { error } = validationAddress.validate({ id });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const deleted = await this.addressService.deleteAddress(id);
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

		const validationAddress = ValidationAddress.updateAddress;
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

			const updatedAddress = await this.addressService.updateAddress(
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
			const addresses = await this.addressService.getAllAddresses();
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

		const validationAddress = ValidationAddress.getAddressById;
		const { error } = validationAddress.validate({ id });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const address = await this.addressService.getAddressById(id);
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

		const validationAddress = ValidationAddress.getAddressesByUser;
		const { error } = validationAddress.validate({ userId });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const addresses = await this.addressService.getAddressesByUser(userId);
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
			const address = await this.addressService.getDefaultAddressByUser(userId);
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

		const validationAddress = ValidationAddress.getAddressesPaginated;
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
			const result = await this.addressService.getAddressesPaginated({
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

		const validationAddress = ValidationAddress.setDefaultAddress;
		const { error } = validationAddress.validate({ id, userId });

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: error.details[0].message,
			});
		}

		try {
			const address = await this.addressService.setDefaultAddress(id, userId);
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
			const count = await this.addressService.getAddressesCountByUser(userId);
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

export default new AddressController();
