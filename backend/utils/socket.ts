import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import redisClient from "./redis";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket: Socket) => {
        const userId = socket.handshake.query.userId as string;

        if (userId) {
            redisClient.set(`active_user:${userId}`, socket.id);
            socket.join(userId); // Join personal room for private notifications
            io.emit("userOnline", userId);
        }

        socket.on("joinConversation", (conversationId: string) => {
            socket.join(conversationId);
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
            if (userId) {
                redisClient.del(`active_user:${userId}`);
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
