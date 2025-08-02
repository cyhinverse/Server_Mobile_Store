import express from 'express';
import userController from './user.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * USER MANAGEMENT ROUTES (Admin Only)
 */
// Get user statistics (put this BEFORE other routes with parameters)
router.get(
	'/admin/stats',
	checkPermission(['admin']),
	userController.getUserStats
);

// Create new user
router.post('/', checkPermission(['admin']), userController.createUser);

// Get all users with pagination
router.get('/', checkPermission(['admin']), userController.getAllUsers);

// Get user by ID
router.get('/:userId', checkPermission(['admin']), userController.getUserById);

// Update user
router.patch('/:userId', checkPermission(['admin']), userController.updateUser);

// Delete user
router.delete(
	'/:userId',
	checkPermission(['admin']),
	userController.deleteUser
);

/**
 * ADDRESS MANAGEMENT ROUTES
 */
// Add address to user
router.post('/:userId/addresses', userController.addAddress);

// Update user address
router.patch('/:userId/addresses/:addressId', userController.updateAddress);

// Delete user address
router.delete('/:userId/addresses/:addressId', userController.deleteAddress);

// Set default address
router.patch(
	'/:userId/addresses/:addressId/default',
	userController.setDefaultAddress
);

// Get user addresses
router.get('/:userId/addresses', userController.getAddressesByUser);

// Get address by ID
router.get('/:userId/addresses/:addressId', userController.getAddressById);

// Get default address
router.get('/:userId/addresses/default/get', userController.getDefaultAddress);

// Count addresses by user
router.get(
	'/:userId/addresses/count/total',
	userController.countAddressesByUser
);

/**
 * ADMIN ADDRESS ROUTES
 */
// Get all addresses with pagination (Admin only)
router.get(
	'/admin/addresses/paginated',
	checkPermission(['admin']),
	userController.getAllAddressesPaginated
);

export default router;
