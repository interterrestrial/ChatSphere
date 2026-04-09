import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
}

export interface Conversation {
  _id: string;
  title: string | null;
  isGroup: boolean;
  participants: Participant[];
  lastMessage: Message | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Partial<Record<string, Message[]>>; // mapped by conversationId
  isLoading: boolean;
}

const mockConversations: Conversation[] = [
  {
    _id: 'c1',
    title: 'Project Alpha Team',
    isGroup: true,
    participants: [{ _id: 'u1', name: 'John Doe' }, { _id: 'u2', name: 'Sarah Smith' }],
    lastMessage: {
      _id: 'm2',
      conversationId: 'c1',
      senderId: 'u2',
      content: 'I will push the updates to the repository later today.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'c2',
    title: null,
    isGroup: false,
    participants: [{ _id: 'u1', name: 'John Doe' }, { _id: 'u3', name: 'Alex Johnson' }],
    lastMessage: {
      _id: 'm1',
      conversationId: 'c2',
      senderId: 'u3',
      content: 'Hey, are we still meeting at 3 PM?',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockMessages: Partial<Record<string, Message[]>> = {
  'c1': [
    {
      _id: 'm1',
      conversationId: 'c1',
      senderId: 'u1',
      content: 'Has anyone checked the new design mockups?',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      _id: 'm2',
      conversationId: 'c1',
      senderId: 'u2',
      content: 'I will push the updates to the repository later today.',
      isRead: false,
      createdAt: new Date().toISOString(),
    }
  ],
  'c2': [
     {
      _id: 'm1',
      conversationId: 'c2',
      senderId: 'u3',
      content: 'Hey, are we still meeting at 3 PM?',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    }
  ]
};

const initialState: ChatState = {
  conversations: mockConversations,
  activeConversation: null,
  messages: mockMessages,
  isLoading: false,
};

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
      state.messages[msg.conversationId]!.push(msg);
      
      const conv = state.conversations.find(c => c._id === msg.conversationId);
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        // move to top
        state.conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
    },
  },
});

export const { setConversations, setActiveConversation, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
