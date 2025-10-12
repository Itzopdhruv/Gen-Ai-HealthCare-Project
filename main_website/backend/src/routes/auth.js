import express from 'express';
import { register, login, getMe, updateProfile, logout, loginComplete } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegistration, validateLogin, validateProfileUpdate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/login-complete', loginComplete);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);
router.post('/logout', authenticateToken, logout);

export default router;
