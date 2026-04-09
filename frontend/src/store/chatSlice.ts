import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

const now = new Date();
const ago = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

const mockConversations: Conversation[] = [
  {
    _id: 'c1',
    title: 'Project Alpha Team',
    isGroup: true,
    participants: [
      { _id: 'u1', name: 'John Doe',     avatar: 'https://i.pravatar.cc/150?u=u1' },
      { _id: 'u2', name: 'Sarah Smith',  avatar: 'https://i.pravatar.cc/150?u=u2' },
      { _id: 'u4', name: 'Mike Chen',    avatar: 'https://i.pravatar.cc/150?u=u4' },
    ],
    lastMessage: {
      _id: 'ml_c1_3', conversationId: 'c1', senderId: 'u2',
      content: "I'll push the updates to the repo later today 🚀",
      isRead: false, createdAt: ago(2),
    },
    unreadCount: 3,
    createdAt: ago(1440), updatedAt: ago(2),
  },
  {
    _id: 'c2',
    title: null,
    isGroup: false,
    participants: [
      { _id: 'u1', name: 'John Doe',    avatar: 'https://i.pravatar.cc/150?u=u1' },
      { _id: 'u3', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=u3' },
    ],
    lastMessage: {
      _id: 'ml_c2_2', conversationId: 'c2', senderId: 'u3',
      content: 'Hey, are we still meeting at 3 PM?',
      isRead: true, createdAt: ago(60),
    },
    unreadCount: 0,
    createdAt: ago(2880), updatedAt: ago(60),
  },
  {
    _id: 'c3',
    title: 'Design Reviews',
    isGroup: true,
    participants: [
      { _id: 'u1', name: 'John Doe',   avatar: 'https://i.pravatar.cc/150?u=u1' },
      { _id: 'u5', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?u=u5' },
      { _id: 'u6', name: 'Ryan Park',   avatar: 'https://i.pravatar.cc/150?u=u6' },
    ],
    lastMessage: {
      _id: 'ml_c3_2', conversationId: 'c3', senderId: 'u5',
      content: 'The new Figma frames look absolutely fire 🔥',
      isRead: false, createdAt: ago(180),
    },
    unreadCount: 1,
    createdAt: ago(720), updatedAt: ago(180),
  },
  {
    _id: 'c4',
    title: null,
    isGroup: false,
    participants: [
      { _id: 'u1', name: 'John Doe',  avatar: 'https://i.pravatar.cc/150?u=u1' },
      { _id: 'u6', name: 'Ryan Park', avatar: 'https://i.pravatar.cc/150?u=u6' },
    ],
    lastMessage: {
      _id: 'ml_c4_1', conversationId: 'c4', senderId: 'u1',
      content: 'Check out this article on WebSockets!',
      isRead: true, createdAt: ago(300),
    },
    unreadCount: 0,
    createdAt: ago(4320), updatedAt: ago(300),
  },
];

const mockMessages: Partial<Record<string, Message[]>> = {
  c1: [
    {
      _id: 'ml_c1_1', conversationId: 'c1', senderId: 'u1',
      content: 'Has anyone checked the new design mockups for the dashboard?',
      isRead: true, createdAt: ago(130),
      reactions: [{ emoji: '👀', userIds: ['u2', 'u4'] }],
    },
    {
      _id: 'ml_c1_2', conversationId: 'c1', senderId: 'u4',
      content: 'Yeah! They look great. Especially the glassmorphism effect on the sidebar.',
      isRead: true, createdAt: ago(120),
      reactions: [{ emoji: '🔥', userIds: ['u1'] }, { emoji: '💯', userIds: ['u2'] }],
    },
    {
      _id: 'ml_c1_3', conversationId: 'c1', senderId: 'u2',
      content: "I'll push the updates to the repo later today 🚀",
      isRead: false, createdAt: ago(2),
    },
  ],
  c2: [
    {
      _id: 'ml_c2_1', conversationId: 'c2', senderId: 'u1',
      content: 'Hey Alex! Did you get a chance to review the PR I sent?',
      isRead: true, createdAt: ago(90),
    },
    {
      _id: 'ml_c2_2', conversationId: 'c2', senderId: 'u3',
      content: 'Hey, are we still meeting at 3 PM?',
      isRead: true, createdAt: ago(60),
    },
  ],
  c3: [
    {
      _id: 'ml_c3_1', conversationId: 'c3', senderId: 'u1',
      content: 'Just shared the Figma link in the channel. Please take a look!',
      isRead: true, createdAt: ago(200),
    },
    {
      _id: 'ml_c3_2', conversationId: 'c3', senderId: 'u5',
      content: 'The new Figma frames look absolutely fire 🔥',
      isRead: false, createdAt: ago(180),
      reactions: [{ emoji: '❤️', userIds: ['u1'] }],
    },
  ],
  c4: [
    {
      _id: 'ml_c4_1', conversationId: 'c4', senderId: 'u1',
      content: 'Check out this article on WebSockets!',
      isRead: true, createdAt: ago(300),
    },
  ],
};

const initialState: ChatState = {
  conversations: mockConversations,
  activeConversation: null,
  messages: mockMessages,
  isLoading: false,
  typingUsers: {},
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
        state.conversations.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    },
    addReaction: (state, action: PayloadAction<{ convId: string; msgId: string; emoji: string; userId: string }>) => {
      const { convId, msgId, emoji, userId } = action.payload;
      const msgs = state.messages[convId];
      if (!msgs) return;
      const msg = msgs.find(m => m._id === msgId);
      if (!msg) return;
      if (!msg.reactions) msg.reactions = [];
      const existing = msg.reactions.find(r => r.emoji === emoji);
      if (existing) {
        const idx = existing.userIds.indexOf(userId);
        if (idx === -1) existing.userIds.push(userId);
        else existing.userIds.splice(idx, 1);
        msg.reactions = msg.reactions.filter(r => r.userIds.length > 0);
      } else {
        msg.reactions.push({ emoji, userIds: [userId] });
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
});

export const {
  setConversations,
  setActiveConversation,
  addMessage,
  addReaction,
  setTypingUser,
  markConversationRead,
} = chatSlice.actions;

export default chatSlice.reducer;
