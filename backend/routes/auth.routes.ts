import express from 'express';
import { register, login, googleAuth, chooseUsername } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.post('/choose-username', requireAuth, chooseUsername);

export default router;
