import express from 'express';
import passport from 'passport';
import authController from './auth.controller.js';
import { litmitRate } from '../../middlewares/litmitRate.js';

const router = express.Router();

router.post('/register', litmitRate, authController.register);
router.post('/login', litmitRate, authController.login);
router.get(
	'/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
	'/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	authController.loginWithGoogle
);
router.get('/logout', authController.logout);
export default router;
