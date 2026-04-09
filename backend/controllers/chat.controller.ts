import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import redisClient from '../utils/redis';

// Fetch all conversations for a user
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const cacheKey = `conversations:${userId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      res.status(200).json(JSON.parse(cachedData));
      return;
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email username _id')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Cache conversations for 1 minute
    await redisClient.setex(cacheKey, 60, JSON.stringify(conversations));

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch messages for a conversation
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      res.status(403).json({ message: 'Not authorized or conversation not found' });
      return;
    }

    const cacheKey = `messages:${conversationId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      res.status(200).json(JSON.parse(cachedData));
      return;
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // Cache messages for 1 min
    await redisClient.setex(cacheKey, 60, JSON.stringify(messages));

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
