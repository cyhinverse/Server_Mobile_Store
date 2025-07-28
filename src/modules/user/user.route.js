import express from 'express';
import UserController from './user.controller.js';
import authMiddleware from '../../middlewares/auth.js';
const router = express.Router();

router.use(authMiddleware);

router.post('/', UserController.createUser);
router.get('/:id', UserController.getUserById);
router.patch('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
router.get('/', UserController.getAllUser);
router.post('/:id/change-password', UserController.changePassword);
router.post('/:id/reset-password', UserController.ResetPassword);
router.post('/addresses', UserController.createAddress);
router.delete('/addresses/delete', UserController.deleteAddress);
router.put('/addresses/update', UserController.updateAddress);
router.patch('/addresses/set-default', UserController.setDefaultAddress);
router.get('/addresses/:addressId', UserController.getAddressById);
router.get('/addresses/byuser', UserController.getAddressesByUser);

router.get(
	'/:userId/addresses/default',
	UserController.getDefaultAddressByUser
);

router.get('/admin', UserController.getAllUser);

router.get('/admin/addresses', UserController.getAllAddresses);

router.get('/admin/addresses/paginated', UserController.getAddressesPaginated);

router.get(
	'/admin/:userId/addresses/count',
	UserController.getAddressesCountByUser
);

export default router;
