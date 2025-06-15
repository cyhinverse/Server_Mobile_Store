import express from "express";
import UserController from "../controllers/user.controller.js";
import passport from "passport";


const router = express.Router();


router.post("/register", UserController.register)
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }), UserController.loginWithGoogle
);
export default router;