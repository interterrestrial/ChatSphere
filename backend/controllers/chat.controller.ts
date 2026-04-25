import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import User from "../models/user.model";
import { getIo } from "../utils/socket";
import { generateSmartReply } from "../utils/gemini";

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "_id name")
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
        io.to(conversationId).emit("newMessage", message);

        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to send message", error: error.message });
    }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { participantId } = req.body;

        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [userId, participantId] }
        }).populate("participants", "_id name");

        if (!conversation) {
            conversation = new Conversation({
                participants: [userId, participantId],
                isGroup: false
            });
            await conversation.save();
            conversation = await conversation.populate("participants", "_id name");
        }

        res.status(200).json(conversation);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to create conversation", error: error.message });
    }
};

export const getSmartReply = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { messageContent } = req.body;
        const reply = await generateSmartReply(messageContent);
        res.status(200).json({ reply });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to get smart reply", error: error.message });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const users = await User.find({ _id: { $ne: userId } }).select("_id name username");
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to get users", error: error.message });
    }
};
