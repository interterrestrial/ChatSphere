import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import User from "../models/user.model";
import { getIo } from "../utils/socket";

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "_id name username")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to get conversations", error: error.message });
    }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to get messages", error: error.message });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.userId;
        const { conversationId, content } = req.body;

        if (!conversationId || !content) {
            res.status(400).json({ message: "conversationId and content are required" });
            return;
        }

        const message = new Message({
            conversationId,
            senderId,
            content
        });
        await message.save();

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: new Date()
        });

        const io = getIo();
        // Emit to all users in the conversation room
        io.to(conversationId).emit("newMessage", message);

        // Also emit to participant personal rooms so sidebar updates even if they haven't joined the conv room
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            conversation.participants.forEach((participantId: any) => {
                const pid = participantId.toString();
                if (pid !== senderId) {
                    io.to(pid).emit("newMessage", message);
                }
            });
        }

        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to send message", error: error.message });
    }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { participantId } = req.body;

        if (!participantId) {
            res.status(400).json({ message: "participantId is required" });
            return;
        }

        // Check if a DM conversation already exists between these two users
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [userId, participantId], $size: 2 }
        }).populate("participants", "_id name username")
          .populate("lastMessage");

        if (!conversation) {
            conversation = new Conversation({
                participants: [userId, participantId],
                isGroup: false
            });
            await conversation.save();
            conversation = await conversation.populate("participants", "_id name username");
        }

        res.status(200).json(conversation);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to create conversation", error: error.message });
    }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            res.status(200).json([]);
            return;
        }

        const searchQuery = q.trim().toLowerCase();

        const users = await User.find({
            _id: { $ne: userId },
            isUsernameSet: true,
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { name: { $regex: searchQuery, $options: 'i' } }
            ]
        }).select("_id name username").limit(10);

        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to search users", error: error.message });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const users = await User.find({ _id: { $ne: userId }, isUsernameSet: true }).select("_id name username");
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to get users", error: error.message });
    }
};
