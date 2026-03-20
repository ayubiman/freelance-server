import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, verifyEmail, verifyOtp } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRoutes = express.Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.post('/send-verify-otp', userAuth, verifyOtp);
authRoutes.post('/verify-account', userAuth, verifyEmail);
authRoutes.post('/is-authenticated', userAuth, isAuthenticated);
authRoutes.post('/send-reset-otp', sendResetOtp);
authRoutes.post('/reset-password', resetPassword);



export default authRoutes;