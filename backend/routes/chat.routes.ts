import express from 'express';
import { getConversations, getMessages, createConversation } from '../controllers/chat.controller';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/conversations', requireAuth, (req, res) => getConversations(req as any, res));
router.post('/conversations', requireAuth, (req, res) => createConversation(req as any, res));
router.get('/messages/:conversationId', requireAuth, (req, res) => getMessages(req as any, res));

export default router;
