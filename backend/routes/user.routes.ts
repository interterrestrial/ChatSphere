import express from 'express';
import { searchUsers } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/search', requireAuth, (req, res) => searchUsers(req as any, res));

export default router;
