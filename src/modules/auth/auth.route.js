import express from 'express';
import passport from 'passport';
import AuthController from './auth.controller.js';
import { litmitRate } from '../../middlewares/litmitRate.js';
import { checkPermission } from '../../middlewares/permission.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

router.post('/register', litmitRate, AuthController.register);
router.post('/login', litmitRate, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/send-verify-code', AuthController.sendCodeToVerifyEmail);
router.post('/verify-email', AuthController.verifyEmail);
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
router.get('/roles', AuthController.getAllRoles);

router.post(
	'/roles/:id/permissions',
	authMiddleware,
	checkPermission('roles.update'),
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

router.get(
	'/users/roles',
	authMiddleware,
	checkPermission('permissions.view'),
	AuthController.getUsersByRole
);

router.post(
	'/roles/:userId/assign',
	authMiddleware,
	checkPermission('roles.view'),
	AuthController.assignRoleToUser
);
router.post(
	'/roles/:userId/revoke',
	authMiddleware,
	checkPermission('roles.view'),
	AuthController.revokeRoleFromUser
);
export default router;
