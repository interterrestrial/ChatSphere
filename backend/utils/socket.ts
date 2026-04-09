import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model';
import redisClient from './redis';

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_here";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));
      
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected to socket: ${userId}`);

    // Join personal room for private notifications
    socket.join(userId);

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined room ${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content } = data;
        
        // Save to DB
        const newMessage = new Message({
          conversationId,
          senderId: userId,
          content,
          isRead: false,
        });
        await newMessage.save();

        // Invalidate Redis cache for this conversation's messages
        await redisClient.del(`messages:${conversationId}`);

        // Broadcast to room
        io.to(conversationId).emit('newMessage', newMessage);
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('typing', {
        userId,
        conversationId: data.conversationId,
        isTyping: true,
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(data.conversationId).emit('typing', {
        userId,
        conversationId: data.conversationId,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};
