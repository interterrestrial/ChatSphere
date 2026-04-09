import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:6001';

class SocketService {
  public socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(URL, {
      auth: { token },
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  sendMessage(conversationId: string, content: string) {
    if (this.socket) {
      this.socket.emit('sendMessage', { conversationId, content });
    }
  }

  emitTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId });
    }
  }

  emitStopTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('stopTyping', { conversationId });
    }
  }
}

const socketService = new SocketService();
export default socketService;
