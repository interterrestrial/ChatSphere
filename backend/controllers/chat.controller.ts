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
    let cachedData = null;
    try {
      cachedData = await redisClient.get(cacheKey);
    } catch(e) { /* redis offline */ }

    if (cachedData) {
      res.status(200).json(JSON.parse(cachedData));
      return;
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email username _id')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Cache conversations for 1 minute
    try {
      await redisClient.setex(cacheKey, 60, JSON.stringify(conversations));
    } catch(e) { /* redis offline */ }

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
    let cachedData = null;
    try {
      cachedData = await redisClient.get(cacheKey);
    } catch(e) { /* redis offline */ }

    if (cachedData) {
      res.status(200).json(JSON.parse(cachedData));
      return;
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // Cache messages for 1 min
    try {
      await redisClient.setex(cacheKey, 60, JSON.stringify(messages));
    } catch(e) { /* redis offline */}

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, isGroup, participants } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      res.status(400).json({ message: 'At least one participant is required' });
      return;
    }

    const allParticipants = [...new Set([userId, ...participants])];

    const newConv = new Conversation({
      title: isGroup ? title : null,
      isGroup,
      participants: allParticipants,
    });

    await newConv.save();

    // Invalidate conversation cache for all participants
    for (const p of allParticipants) {
      try {
        await redisClient.del(`conversations:${p}`);
      } catch(e) {}
    }

    const populatedConv = await Conversation.findById(newConv._id)
      .populate('participants', 'name email username avatar _id');

    res.status(201).json(populatedConv);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
