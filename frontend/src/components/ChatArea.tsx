import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { RootState } from '../store/index.ts';
import { setTypingUser, fetchMessages } from '../store/chatSlice.ts';
import socketService from '../socket.ts';
import {
  Send, Sparkles, MoreVertical, Phone, Video,
  Paperclip, Smile, CheckCheck, Check, X
} from 'lucide-react';
import TypingIndicator from './TypingIndicator.tsx';
import AISummaryPanel from './AISummaryPanel.tsx';

interface ChatAreaProps {
  convId: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '💯', '👀', '🎉', '🚀'];

const SMART_REPLIES: Record<string, string[]> = {
  default: [
    "Sounds good to me!",
    "I'll check it and get back to you.",
    "Can we discuss this on a call?",
  ],
  question: [
    "Yes, absolutely!",
    "Let me check on that.",
    "Not sure yet, I'll confirm.",
  ],
  greeting: [
    "Hey! How's it going?",
    "Hi! Good to hear from you 👋",
    "Hey, what's up?",
  ],
};

const ChatArea: React.FC<ChatAreaProps> = ({ convId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations, messages, typingUsers } = useSelector((state: RootState) => state.chat);

  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [showReactionFor, setShowReactionFor] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conv = conversations.find(c => c._id === convId);
  const convMessages = useMemo(() => messages[convId] || [], [messages, convId]);
  const convTypingUsers = typingUsers[convId] || [];

  // Get names of typing participants (not the current user)
  const typingNames = convTypingUsers
    .filter(id => id !== user?._id)
    .map(id => conv?.participants.find(p => p._id === id)?.name || 'Someone');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages, convId, typingNames.length]);

  useEffect(() => {
    // Join conversation room in socket
    socketService.joinConversation(convId);
    
    // Fetch messages from DB if not already loaded
    if (!messages[convId]) {
      dispatch(fetchMessages(convId));
    }

    return () => {
      socketService.leaveConversation(convId);
    };
  }, [convId, dispatch, messages]);

  // Close pickers on outside click
  useEffect(() => {
    const handler = () => {
      setShowEmojiPicker(false);
      setShowReactionFor(null);
      setShowMenu(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (!conv) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Conversation not found.</div>;
  }

  const participantName = conv.isGroup
    ? null
    : conv.participants.find(p => p._id !== user?._id)?.name;
  const participantAvatar = conv.isGroup
    ? null
    : conv.participants.find(p => p._id !== user?._id)?.avatar;
  const displayTitle = conv.title || participantName || 'Unknown User';

  // Smart replies based on last message content
  const lastMsg = convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;
  const smartReplies = useMemo(() => {
    if (!lastMsg || lastMsg.senderId === user?._id) return [];
    const c = lastMsg.content.toLowerCase();
    if (c.includes('?')) return SMART_REPLIES.question;
    if (c.includes('hey') || c.includes('hi') || c.includes('hello')) return SMART_REPLIES.greeting;
    return SMART_REPLIES.default;
  }, [lastMsg, user]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    // Stop typing indicator
    socketService.emitStopTyping(convId);
    dispatch(setTypingUser({ convId, userId: user!._id, isTyping: false }));
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    // Send via socket
    socketService.sendMessage(convId, inputText.trim());
    
    // Optimistic UI update could be added here, but socket broadcasts back to us too.
    setInputText('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    // Simulate typing indicator
    socketService.emitTyping(convId);
    dispatch(setTypingUser({ convId, userId: user!._id, isTyping: true }));
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketService.emitStopTyping(convId);
      dispatch(setTypingUser({ convId, userId: user!._id, isTyping: false }));
    }, 2000);
  };

  const handleSmartReply = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  const handleReaction = (msgId: string, emoji: string) => {
    // Reaction API logic to be added
    console.log(`Reacted ${emoji} to ${msgId}`);
    setShowReactionFor(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSendMessage();
  };

  /* ─────────────── Render ─────────────── */
  return (
    <>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.9rem 1.5rem',
        borderBottom: '1px solid var(--border-medium)',
        background: 'rgba(255,255,255,0.015)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {conv.isGroup ? (
            <div style={{
              width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '1.1rem' }}>👥</span>
            </div>
          ) : (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={participantAvatar || `https://ui-avatars.com/api/?name=${displayTitle}&background=6366f1&color=fff`}
                alt={displayTitle}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div className="status-indicator status-online" />
            </div>
          )}

          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{displayTitle}</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--success)' }}>
              {conv.isGroup
                ? `${conv.participants.length} members · Active`
                : 'Online'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="btn-icon" title="Voice call"><Phone size={18} /></button>
          <button className="btn-icon" title="Video call"><Video size={18} /></button>
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              title="More options"
              onClick={e => { e.stopPropagation(); setShowMenu(p => !p); }}
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem',
                  minWidth: '180px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 50,
                  animation: 'fadeInScale 0.15s ease forwards',
                }}
              >
                {['View Profile', 'Search in Chat', 'Mute Notifications', 'Clear History'].map(opt => (
                  <button
                    key={opt}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem', color: 'var(--text-secondary)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AI Summary Panel ── */}
      {conv.isGroup && (
        <AISummaryPanel
          conversationTitle={displayTitle}
          messageCount={convMessages.length}
        />
      )}

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '1.25rem 1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
      }}>
        {/* Date divider */}
        <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem' }}>
          <span style={{
            background: 'var(--bg-tertiary)', padding: '0.3rem 1rem',
            borderRadius: 'var(--radius-full)', fontSize: '0.72rem',
            color: 'var(--text-tertiary)', fontWeight: 500,
          }}>
            Today
          </span>
        </div>

        {convMessages.map((msg) => {
          const isMine = msg.senderId === user?._id;
          const sender = isMine
            ? user
            : conv.participants.find(p => p._id === msg.senderId);

          return (
            <div
              key={msg._id}
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '72%',
                flexDirection: isMine ? 'row-reverse' : 'row',
                position: 'relative',
                animation: 'fadeIn 0.2s ease forwards',
              }}
              onMouseEnter={() => setHoveredMsgId(msg._id)}
              onMouseLeave={() => { setHoveredMsgId(null); }}
            >
              {/* Avatar (others only) */}
              {!isMine && (
                <div style={{ flexShrink: 0, marginTop: 'auto' }}>
                  <img
                    src={(sender as any)?.avatar || `https://ui-avatars.com/api/?name=${sender?.name || 'U'}&background=6366f1&color=fff`}
                    alt="avatar"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {/* Sender name (group, not me) */}
                {!isMine && conv.isGroup && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', marginLeft: '0.5rem' }}>
                    {sender?.name}
                  </span>
                )}

                {/* Bubble + hover reaction picker */}
                <div style={{ position: 'relative' }}>
                  {/* Reaction emoji picker on hover */}
                  {hoveredMsgId === msg._id && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        [isMine ? 'left' : 'right']: 'calc(100% + 6px)',
                        top: '50%', transform: 'translateY(-50%)',
                        zIndex: 10,
                        animation: 'fadeInScale 0.15s ease forwards',
                      }}
                    >
                      <button
                        className="btn-icon"
                        style={{ width: '30px', height: '30px', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)' }}
                        onClick={e => { e.stopPropagation(); setShowReactionFor(p => p === msg._id ? null : msg._id); }}
                        title="Add reaction"
                      >
                        <Smile size={15} />
                      </button>
                    </div>
                  )}

                  {/* Emoji picker popup */}
                  {showReactionFor === msg._id && (
                    <div
                      className="emoji-picker-popup"
                      onClick={e => e.stopPropagation()}
                      style={{
                        [isMine ? 'right' : 'left']: 0,
                        bottom: 'calc(100% + 8px)',
                      }}
                    >
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          className="emoji-option"
                          onClick={() => handleReaction(msg._id, emoji)}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div style={{
                    background: isMine ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                    color: isMine ? 'white' : 'var(--text-primary)',
                    padding: '0.7rem 1rem',
                    borderRadius: isMine
                      ? '1.25rem 1.25rem 0.25rem 1.25rem'
                      : '1.25rem 1.25rem 1.25rem 0.25rem',
                    boxShadow: isMine ? '0 2px 12px var(--accent-glow)' : 'var(--shadow-sm)',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                </div>

                {/* Reactions row */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="reactions-bar" style={{ marginTop: '4px', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    {msg.reactions.map(r => (
                      <button
                        key={r.emoji}
                        className={`reaction-pill ${r.userIds.includes(user!._id) ? 'mine' : ''}`}
                        onClick={() => handleReaction(msg._id, r.emoji)}
                        title={`${r.userIds.length} reaction${r.userIds.length > 1 ? 's' : ''}`}
                      >
                        {r.emoji}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                          {r.userIds.length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp + read receipt */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMine && (
                    <span className="read-tick">
                      {msg.isRead
                        ? <CheckCheck size={13} />
                        : <Check size={13} style={{ color: 'var(--text-tertiary)' }} />
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingNames.length > 0 && (
          <div style={{ alignSelf: 'flex-start' }}>
            <TypingIndicator names={typingNames} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Gemini Smart Replies ── */}
      {smartReplies.length > 0 && (
        <div style={{
          padding: '0.6rem 1.5rem',
          display: 'flex', gap: '0.5rem', overflowX: 'auto',
          borderTop: '1px solid var(--border-light)',
          background: 'rgba(99, 102, 241, 0.04)',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--accent-secondary)', fontSize: '0.75rem', fontWeight: 700,
            paddingRight: '0.5rem', flexShrink: 0,
          }}>
            <Sparkles size={14} /> Gemini
          </div>
          {smartReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSmartReply(reply)}
              className="chip"
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Area ── */}
      <div style={{
        padding: '1rem 1.5rem',
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid var(--border-medium)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button className="btn-icon" title="Attach file"><Paperclip size={18} /></button>

          <div style={{ flex: 1, position: 'relative' }}>
            {/* Emoji picker (input) */}
            {showEmojiPicker && (
              <div
                className="emoji-picker-popup"
                onClick={e => e.stopPropagation()}
                style={{ bottom: 'calc(100% + 10px)', right: 0 }}
              >
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    className="emoji-option"
                    onClick={() => { setInputText(p => p + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              className="input-glass"
              placeholder="Type a message…"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              style={{ borderRadius: 'var(--radius-full)', paddingRight: '3rem', fontSize: '0.9rem' }}
            />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setShowEmojiPicker(p => !p); }}
              style={{
                position: 'absolute', right: '0.8rem', top: '50%',
                transform: 'translateY(-50%)',
                color: showEmojiPicker ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                background: 'transparent',
                transition: 'color var(--transition-fast)',
              }}
            >
              {showEmojiPicker ? <X size={18} /> : <Smile size={18} />}
            </button>
          </div>

          <button
            onClick={() => handleSendMessage()}
            className="btn-primary"
            style={{
              width: '46px', height: '46px', padding: 0,
              borderRadius: 'var(--radius-full)', flexShrink: 0,
              opacity: inputText.trim() ? 1 : 0.5,
            }}
            disabled={!inputText.trim()}
          >
            <Send size={18} style={{ transform: 'translateX(1px)' }} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatArea;
