import express from "express";
import UserController from "../controllers/user.controller.js";
import passport from "passport";
import authController from "../controllers/auth.controller.js";


const router = express.Router();


router.post("/register", authController.register)
router.post("/login", authController.login);
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }), authController.loginWithGoogle
);
export default router;