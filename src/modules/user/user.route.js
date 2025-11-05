import express from 'express';
import userController from './user.controller.js';
import authMiddleware from '../../middlewares/auth.js';
import checkPermission from '../../middlewares/permission.js';
import { SYSTEM_PERMISSIONS } from '../../configs/permission.config.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * CURRENT USER ROUTES
 */
// Get current authenticated user
router.get('/me', userController.getMe);

// Update current user profile
router.patch('/me', userController.updateMe);

/**
 * USER MANAGEMENT ROUTES (Admin Only)
 */
// Get user statistics (put this BEFORE other routes with parameters)
router.get(
	'/admin/stats',
	checkPermission([SYSTEM_PERMISSIONS.USER_READ]),
	userController.getUserStats
);

// Get all addresses with pagination (Admin only)
router.get(
	'/admin/addresses/paginated',
	checkPermission([SYSTEM_PERMISSIONS.USER_READ]),
	userController.getAllAddressesPaginated
);

// Create new user
router.post(
	'/',
	checkPermission([SYSTEM_PERMISSIONS.USER_CREATE]),
	userController.createUser
);

// Get all users with pagination
router.get(
	'/',
	checkPermission([SYSTEM_PERMISSIONS.USER_READ]),
	userController.getAllUsers
);

// Get user by ID
router.get(
	'/:userId',
	checkPermission([SYSTEM_PERMISSIONS.USER_READ]),
	userController.getUserById
);

// Update user
router.patch(
	'/:userId',
	checkPermission([SYSTEM_PERMISSIONS.USER_UPDATE]),
	userController.updateUser
);

// Delete user
router.delete(
	'/:userId',
	checkPermission([SYSTEM_PERMISSIONS.USER_DELETE]),
	userController.deleteUser
);

/**
 * PROFILE MANAGEMENT ROUTES (User can update their own profile)
 */
// Update user profile (phone, dayOfBirth, isStudent, isTeacher)
router.patch('/:userId/profile', userController.updateProfile);

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

export default router;
