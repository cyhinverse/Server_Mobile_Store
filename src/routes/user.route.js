import express from 'express';
import UserController from '../controllers/user.controller.js';
import passport from 'passport';

const router = express.Router();
router.post('/create', UserController.createUser);
router.post('/:id/delete', UserController.deleteUser);
router.post('/:id/update', UserController.updateUser);

export default router;
