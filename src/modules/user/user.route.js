import express from 'express';
import UserController from './user.controller.js';

const router = express.Router();

router.post('/users', UserController.createUser);
router.get('/users/:id', UserController.getUserById);
router.patch('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

router.post('/users/:userId/addresses', UserController.createAddress);

router.delete(
	'/users/:userId/addresses/:addressId',
	UserController.deleteAddress
);

router.put('/users/:userId/addresses/:addressId', UserController.updateAddress);

router.patch(
	'/users/:userId/addresses/:addressId/set-default',
	UserController.setDefaultAddress
);

router.get('/users/:userId/addresses', UserController.getAddressesByUser);

router.get(
	'/users/:userId/addresses/default',
	UserController.getDefaultAddressByUser
);

router.get(
	'/users/:userId/addresses/:addressId',
	UserController.getAddressById
);

router.get('/admin/users', UserController.getAllUser);

router.get('/admin/addresses', UserController.getAllAddresses);

router.get('/admin/addresses/paginated', UserController.getAddressesPaginated);

router.get(
	'/admin/users/:userId/addresses/count',
	UserController.getAddressesCountByUser
);

export default router;
