import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (socket) return socket;
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

  socket = io(API_BASE_URL, {
    query: { userId },
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
