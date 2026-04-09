import express from 'express';
import { getConversations, getMessages } from '../controllers/chat.controller';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/conversations', requireAuth, getConversations);
router.get('/messages/:conversationId', requireAuth, getMessages);

export default router;
