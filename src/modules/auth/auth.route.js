import express from 'express';
import passport from 'passport';
import AuthController from './auth.controller.js';
import { litmitRate } from '../../middlewares/litmitRate.js';
import { checkPermission } from '../../middlewares/permission.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

router.post('/register', litmitRate, AuthController.register);
router.post('/login', litmitRate, AuthController.login);
router.get(
	'/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
	'/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	AuthController.loginWithGoogle
);
router.get('/logout', AuthController.logout);
router.get('/roles', checkPermission('roles.read'), AuthController.getAllRoles);

router.post(
	'/roles/:id/permissions',
	checkPermission('roles.update'),
	AuthController.assignPermissions
);

router.post(
	'/permissions/assign',
	authMiddleware,
	checkPermission('permissions.assign'),
	AuthController.assignPermissions
);

router.post(
	'/permissions/revoke',
	authMiddleware,
	checkPermission('permissions.revoke'),
	AuthController.revokePermissions
);

router.get(
	'/users/:userId/permissions',
	authMiddleware,
	checkPermission('permissions.view'),
	AuthController.getUserPermissions
);
export default router;
