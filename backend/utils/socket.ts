import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

// In-memory active users map (userId -> socketId)
const activeUsers = new Map<string, string>();

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket: Socket) => {
        const userId = socket.handshake.query.userId as string;
        console.log(`Socket connected: ${socket.id}, userId: ${userId}`);

        if (userId) {
            activeUsers.set(userId, socket.id);
            socket.join(userId); // Join personal room for private notifications
            io.emit("userOnline", userId);
        }

        socket.on("joinConversation", (conversationId: string) => {
            socket.join(conversationId);
            console.log(`User ${userId} joined room ${conversationId}`);
        });

        socket.on("leaveConversation", (conversationId: string) => {
            socket.leave(conversationId);
        });

        socket.on("typing", ({ conversationId, userId }: { conversationId: string, userId: string }) => {
            socket.to(conversationId).emit("userTyping", { conversationId, userId });
        });

        socket.on("stopTyping", ({ conversationId, userId }: { conversationId: string, userId: string }) => {
            socket.to(conversationId).emit("userStoppedTyping", { conversationId, userId });
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}, userId: ${userId}`);
            if (userId) {
                activeUsers.delete(userId);
                io.emit("userOffline", userId);
            }
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

export const getActiveUsers = () => activeUsers;
