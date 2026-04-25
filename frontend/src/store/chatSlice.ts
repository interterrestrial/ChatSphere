import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Participant {
  _id: string;
  name: string;
  username?: string;
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
  users: Participant[];
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
  users: []
};

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (conversationId: string) => {
  const response = await api.get(`/chat/messages/${conversationId}`);
  return { conversationId, messages: response.data };
});

export const fetchUsers = createAsyncThunk('chat/fetchUsers', async () => {
  const response = await api.get('/chat/users');
  return response.data;
});

export const createConversation = createAsyncThunk('chat/createConversation', async (participantId: string) => {
  const response = await api.post('/chat/conversations', { participantId });
  return response.data;
});

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
    markConversationRead: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find(c => c._id === action.payload);
      if (conv) conv.unreadCount = 0;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.find(c => c._id === action.payload._id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      if (!state.messages[msg.conversationId]) {
        state.messages[msg.conversationId] = [];
      }
      // check if message already exists
      const exists = state.messages[msg.conversationId]?.find(m => m._id === msg._id);
      if (!exists) {
         state.messages[msg.conversationId]?.push(msg);
      }

      // update last message in conversation
      const conv = state.conversations.find(c => c._id === msg.conversationId);
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        // sort conversations by updatedAt
        state.conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        const exists = state.conversations.find(c => c._id === action.payload._id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
        state.activeConversation = action.payload._id;
      });
  }
});

export const {
  setConversations,
  setActiveConversation,
  markConversationRead,
  addConversation,
  addMessage
} = chatSlice.actions;

export default chatSlice.reducer;
