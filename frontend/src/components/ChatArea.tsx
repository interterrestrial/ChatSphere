import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  Send, Paperclip, Phone, Video, MoreVertical,
  Users, Check, CheckCheck, Info, Sparkles
} from 'lucide-react';

interface ChatAreaProps {
  convId: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ convId }) => {
  const { conversations, messages } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [showToast, setShowToast] = useState(false);

  const conversation = conversations.find(c => c._id === convId);
  const convMessages = messages[convId] || [];

  // Determine display title
  const participantName = conversation && !conversation.isGroup
    ? conversation.participants.find(p => p._id !== user?._id)?.name
    : null;
  const displayTitle = conversation?.title || participantName || 'Conversation';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length]);

  const handleSend = () => {
    setShowToast(true);
    setInputText('');
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputText.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  // Find sender name helper
  const getSenderName = (senderId: string) => {
    if (senderId === user?._id) return user?.name || 'You';
    return conversation?.participants.find(p => p._id === senderId)?.name || 'Unknown';
  };

  if (!conversation) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
        <p>Conversation not found</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Chat Header ── */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Avatar */}
          {conversation.isGroup ? (
            <div style={{
              width: '42px', height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Users size={20} color="white" />
            </div>
          ) : (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={`https://ui-avatars.com/api/?name=${displayTitle}&background=6366f1&color=fff`}
                alt={displayTitle}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div className="status-indicator status-online" />
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>{displayTitle}</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              {conversation.isGroup
                ? `${conversation.participants.length} members`
                : 'Online'}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div style={{ display: 'flex', gap: '0.15rem' }}>
          <button className="btn-icon" title="Voice call"><Phone size={17} /></button>
          <button className="btn-icon" title="Video call"><Video size={17} /></button>
          <button className="btn-icon" title="Info"><Info size={17} /></button>
          <button className="btn-icon" title="More"><MoreVertical size={17} /></button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}>
        {convMessages.length === 0 ? (
          <div className="animate-fade-in" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)',
            gap: '0.75rem',
          }}>
            <Sparkles size={32} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: '0.92rem' }}>No messages yet</p>
          </div>
        ) : (
          convMessages.map((msg, idx) => {
            // Use first mock participant as the "current user" for display
            const isMine = msg.senderId === 'u1';
            const senderName = getSenderName(msg.senderId);

            // Date separator
            const showDateSep = idx === 0 || (
              new Date(msg.createdAt).toDateString() !== new Date(convMessages[idx - 1].createdAt).toDateString()
            );

            return (
              <React.Fragment key={msg._id}>
                {showDateSep && (
                  <div style={{
                    textAlign: 'center', padding: '0.75rem 0',
                    fontSize: '0.72rem', color: 'var(--text-tertiary)',
                    fontWeight: 600, letterSpacing: '0.05em',
                  }}>
                    {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                )}

                <div
                  className="animate-fade-in"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: '0.15rem',
                    animationDelay: `${idx * 0.03}s`,
                    opacity: 0,
                    animationFillMode: 'forwards',
                  }}
                >
                  {/* Sender name (group chats only) */}
                  {conversation.isGroup && !isMine && (
                    <span style={{
                      fontSize: '0.72rem', color: 'var(--accent-primary)',
                      fontWeight: 600, marginBottom: '0.25rem', marginLeft: '0.25rem',
                    }}>
                      {senderName}
                    </span>
                  )}

                  {/* Message bubble */}
                  <div style={{ position: 'relative', maxWidth: '70%' }}>
                    <div style={{
                      background: isMine ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.06)',
                      color: isMine ? 'white' : 'var(--text-primary)',
                      padding: '0.85rem 1.15rem',
                      border: isMine ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: isMine
                        ? '1.25rem 1.25rem 0.25rem 1.25rem'
                        : '1.25rem 1.25rem 1.25rem 0.25rem',
                      boxShadow: isMine ? '0 4px 15px var(--accent-glow)' : '0 2px 10px rgba(0,0,0,0.15)',
                      lineHeight: 1.6,
                      fontSize: '0.95rem',
                      letterSpacing: '0.2px',
                      wordBreak: 'break-word' as const,
                    }}>
                      {msg.content}
                    </div>
                  </div>

                  {/* Timestamp + read receipt */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem', opacity: 0.8 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
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
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div style={{
        padding: '1rem 1.5rem',
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid var(--border-medium)',
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Coming soon toast */}
        {showToast && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              top: '-52px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 1.25rem',
              fontSize: '0.82rem',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              boxShadow: 'var(--shadow-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={14} />
            Messaging coming soon!
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button className="btn-icon" title="Attach file"><Paperclip size={18} /></button>

          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="input-glass"
              placeholder="Type a message…"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ borderRadius: 'var(--radius-full)', paddingRight: '1rem', fontSize: '0.9rem' }}
            />
          </div>

          <button
            onClick={handleSend}
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
