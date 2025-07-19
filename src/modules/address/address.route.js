import express from 'express';
const router = express.Router();

import AddressController from './address.controller.js';

// Create a new address
router.post('/', AddressController.createAddress);

// Delete an address by ID
router.delete('/:id', AddressController.deleteAddress);

// Update an address by ID
router.put('/:id', AddressController.updateAddress);

// Set an address as default for a user
router.patch('/:id/set-default', AddressController.setDefaultAddress);

// Get all addresses (admin)
router.get('/all', AddressController.getAllAddresses);

// Get addresses with pagination and search
router.get('/', AddressController.getAddressesPaginated);

// Get all addresses for a specific user
router.get('/user/:userId', AddressController.getAddressesByUser);

// Get default address for a specific user
router.get('/user/:userId/default', AddressController.getDefaultAddressByUser);

// Get address count for a specific user
router.get('/user/:userId/count', AddressController.getAddressesCountByUser);

// Get a specific address by ID
router.get('/:id', AddressController.getAddressById);

export default router;
