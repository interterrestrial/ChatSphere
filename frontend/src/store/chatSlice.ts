import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  reactions?: Reaction[];
}

export interface Participant {
  _id: string;
  name: string;
  avatar?: string;
}

export interface Conversation {
  _id: string;
  title: string | null;
  isGroup: boolean;
  participants: Participant[];
  lastMessage: Message | null;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Partial<Record<string, Message[]>>;
  isLoading: boolean;
  typingUsers: Partial<Record<string, string[]>>;
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
  typingUsers: {},
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);
      return { conversationId, messages: response.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      if (!state.messages[msg.conversationId]) {
        state.messages[msg.conversationId] = [];
      }
      
      // Prevent duplicates
      const exists = state.messages[msg.conversationId]!.find(m => m._id === msg._id);
      if (!exists) {
        state.messages[msg.conversationId]!.push(msg);
      }
      
      const convIndex = state.conversations.findIndex(c => c._id === msg.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = msg;
        state.conversations[convIndex].updatedAt = msg.createdAt;
        // Move to top
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    setTypingUser: (state, action: PayloadAction<{ convId: string; userId: string; isTyping: boolean }>) => {
      const { convId, userId, isTyping } = action.payload;
      if (!state.typingUsers[convId]) state.typingUsers[convId] = [];
      const current = state.typingUsers[convId]!;
      if (isTyping && !current.includes(userId)) current.push(userId);
      if (!isTyping) state.typingUsers[convId] = current.filter(id => id !== userId);
    },
    markConversationRead: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find(c => c._id === action.payload);
      if (conv) conv.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConversations.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conversations = action.payload;
      if (!state.activeConversation && action.payload.length > 0) {
        state.activeConversation = action.payload[0]._id;
      }
    });
    builder.addCase(fetchConversations.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    });
  },
});

export const {
  setConversations,
  setActiveConversation,
  addMessage,
  setTypingUser,
  markConversationRead,
} = chatSlice.actions;

export default chatSlice.reducer;
