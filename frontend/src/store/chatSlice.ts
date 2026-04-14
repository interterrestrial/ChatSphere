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
}

// ── Mock Data ──────────────────────────────────────────────────
const MOCK_PARTICIPANTS: Participant[] = [
  { _id: 'u1', name: 'Alex Rivera' },
  { _id: 'u2', name: 'Sarah Chen' },
  { _id: 'u3', name: 'Jordan Kim' },
  { _id: 'u4', name: 'Emma Wilson' },
  { _id: 'u5', name: 'Ryan Patel' },
];

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    _id: 'conv1',
    title: null,
    isGroup: false,
    participants: [MOCK_PARTICIPANTS[0], MOCK_PARTICIPANTS[1]],
    lastMessage: { _id: 'm1a', conversationId: 'conv1', senderId: 'u1', content: 'Hey! Are we still on for the 3 PM sync?', isRead: true, createdAt: ago(12) },
    createdAt: ago(1440),
    updatedAt: ago(12),
    unreadCount: 0,
  },
  {
    _id: 'conv2',
    title: 'Design Team',
    isGroup: true,
    participants: [MOCK_PARTICIPANTS[0], MOCK_PARTICIPANTS[1], MOCK_PARTICIPANTS[3]],
    lastMessage: { _id: 'm2a', conversationId: 'conv2', senderId: 'u3', content: 'Just pushed the new mockups 🎨', isRead: false, createdAt: ago(45) },
    createdAt: ago(4320),
    updatedAt: ago(45),
    unreadCount: 3,
  },
  {
    _id: 'conv3',
    title: null,
    isGroup: false,
    participants: [MOCK_PARTICIPANTS[0], MOCK_PARTICIPANTS[2]],
    lastMessage: { _id: 'm3a', conversationId: 'conv3', senderId: 'u2', content: 'Thanks for the code review! 🙌', isRead: true, createdAt: ago(180) },
    createdAt: ago(2880),
    updatedAt: ago(180),
    unreadCount: 0,
  },
  {
    _id: 'conv4',
    title: 'Backend Squad',
    isGroup: true,
    participants: [MOCK_PARTICIPANTS[0], MOCK_PARTICIPANTS[4], MOCK_PARTICIPANTS[2]],
    lastMessage: { _id: 'm4a', conversationId: 'conv4', senderId: 'u4', content: 'Redis caching layer is deployed ✅', isRead: false, createdAt: ago(90) },
    createdAt: ago(10080),
    updatedAt: ago(90),
    unreadCount: 1,
  },
  {
    _id: 'conv5',
    title: null,
    isGroup: false,
    participants: [MOCK_PARTICIPANTS[0], MOCK_PARTICIPANTS[3]],
    lastMessage: { _id: 'm5a', conversationId: 'conv5', senderId: 'u3', content: 'Check out this WebSockets article!', isRead: true, createdAt: ago(360) },
    createdAt: ago(5760),
    updatedAt: ago(360),
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    { _id: 'm1-1', conversationId: 'conv1', senderId: 'u1', content: 'Hey Sarah! How\'s the sprint going?', isRead: true, createdAt: ago(120) },
    { _id: 'm1-2', conversationId: 'conv1', senderId: 'u2', content: 'Going well! Just finished the auth module.', isRead: true, createdAt: ago(115) },
    { _id: 'm1-3', conversationId: 'conv1', senderId: 'u1', content: 'Nice! The JWT flow looks clean 👌', isRead: true, createdAt: ago(110) },
    { _id: 'm1-4', conversationId: 'conv1', senderId: 'u2', content: 'Thanks! Added refresh token rotation too.', isRead: true, createdAt: ago(105) },
    { _id: 'm1-5', conversationId: 'conv1', senderId: 'u1', content: 'Are we still on for the 3 PM sync?', isRead: true, createdAt: ago(12) },
  ],
  conv2: [
    { _id: 'm2-1', conversationId: 'conv2', senderId: 'u1', content: 'Team, I\'ve updated the Figma with new color tokens.', isRead: true, createdAt: ago(300) },
    { _id: 'm2-2', conversationId: 'conv2', senderId: 'u4', content: 'The new palette looks amazing 🔥', isRead: true, createdAt: ago(280) },
    { _id: 'm2-3', conversationId: 'conv2', senderId: 'u2', content: 'Agreed. The dark mode contrast is much better now.', isRead: true, createdAt: ago(260) },
    { _id: 'm2-4', conversationId: 'conv2', senderId: 'u3', content: 'Just pushed the new mockups 🎨', isRead: false, createdAt: ago(45) },
  ],
  conv3: [
    { _id: 'm3-1', conversationId: 'conv3', senderId: 'u3', content: 'Can you review my PR when you get a chance?', isRead: true, createdAt: ago(360) },
    { _id: 'm3-2', conversationId: 'conv3', senderId: 'u1', content: 'Sure thing. I\'ll take a look after lunch.', isRead: true, createdAt: ago(350) },
    { _id: 'm3-3', conversationId: 'conv3', senderId: 'u1', content: 'Done — left a few comments on the error handling.', isRead: true, createdAt: ago(200) },
    { _id: 'm3-4', conversationId: 'conv3', senderId: 'u3', content: 'Thanks for the code review! 🙌', isRead: true, createdAt: ago(180) },
  ],
  conv4: [
    { _id: 'm4-1', conversationId: 'conv4', senderId: 'u5', content: 'The new API endpoints are live on staging.', isRead: true, createdAt: ago(480) },
    { _id: 'm4-2', conversationId: 'conv4', senderId: 'u3', content: 'Running load tests now — will report back.', isRead: true, createdAt: ago(400) },
    { _id: 'm4-3', conversationId: 'conv4', senderId: 'u5', content: 'Looking good. Latency is under 50ms for auth routes.', isRead: true, createdAt: ago(200) },
    { _id: 'm4-4', conversationId: 'conv4', senderId: 'u5', content: 'Redis caching layer is deployed ✅', isRead: false, createdAt: ago(90) },
  ],
  conv5: [
    { _id: 'm5-1', conversationId: 'conv5', senderId: 'u4', content: 'Found a great article on WebSocket scaling patterns.', isRead: true, createdAt: ago(400) },
    { _id: 'm5-2', conversationId: 'conv5', senderId: 'u1', content: 'Oh nice, share it!', isRead: true, createdAt: ago(395) },
    { _id: 'm5-3', conversationId: 'conv5', senderId: 'u4', content: 'Check out this WebSockets article!', isRead: true, createdAt: ago(360) },
  ],
};

const initialState: ChatState = {
  conversations: MOCK_CONVERSATIONS,
  activeConversation: null,
  messages: MOCK_MESSAGES,
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
  },
});

export const {
  setConversations,
  setActiveConversation,
  markConversationRead,
  addConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
