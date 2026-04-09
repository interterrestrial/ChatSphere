import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '../store/index.ts';
import { logout } from '../store/authSlice.ts';
import { markConversationRead } from '../store/chatSlice.ts';
import {
  Search, Plus, MessageSquare, Users, LogOut,
  Settings, Sparkles, Bell, Hash
} from 'lucide-react';
import NewChatModal from './NewChatModal.tsx';

interface SidebarProps {
  activeConvId?: string;
}

type FilterTab = 'all' | 'dms' | 'groups';

const Sidebar: React.FC<SidebarProps> = ({ activeConvId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.chat);

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const filtered = useMemo(() => {
    return conversations.filter(conv => {
      const participantName = conv.isGroup
        ? null
        : conv.participants.find(p => p._id !== user?._id)?.name;
      const displayTitle = conv.title || participantName || '';
      const matchesSearch = displayTitle.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        tab === 'all' ||
        (tab === 'dms' && !conv.isGroup) ||
        (tab === 'groups' && conv.isGroup);
      return matchesSearch && matchesTab;
    });
  }, [conversations, search, tab, user]);

  const handleSelectConv = (convId: string) => {
    dispatch(markConversationRead(convId));
    navigate(`/c/${convId}`);
  };

  return (
    <>
      {/* Sidebar wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* ── Top: user profile ── */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                  alt="Profile"
                  className="avatar avatar-md"
                />
                <div className="status-indicator status-online" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>{user?.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div className="online-dot" style={{ width: 7, height: 7 }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>Online</span>
                </div>
              </div>
            </div>

            {/* Action icons */}
            <div style={{ display: 'flex', gap: '0.15rem' }}>
              <button className="btn-icon" title="Notifications" style={{ position: 'relative' }}>
                <Bell size={17} />
                {totalUnread > 0 && (
                  <span style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--danger)', border: '1.5px solid var(--bg-secondary)',
                  }} />
                )}
              </button>
              <button className="btn-icon" onClick={() => alert('Settings menu coming soon!')} title="Settings">
                <Settings size={17} />
              </button>
              <button className="btn-icon" onClick={() => { dispatch(logout()); window.location.href = '/login'; }} title="Logout">
                <LogOut size={17} />
              </button>
            </div>
          </div>

          {/* Search + New chat */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{
                position: 'absolute', left: '0.85rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
              }} />
              <input
                type="text"
                className="input-glass"
                placeholder="Search conversations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  paddingLeft: '2.4rem',
                  paddingTop: '0.55rem',
                  paddingBottom: '0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <button
              className="btn-primary"
              style={{ padding: '0.55rem', borderRadius: 'var(--radius-full)', flexShrink: 0 }}
              onClick={() => setShowModal(true)}
              title="New conversation"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ padding: '0.85rem 1.25rem 0.5rem' }}>
          <div className="tabs-container">
            {(['all', 'dms', 'groups'] as FilterTab[]).map(t => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'all' && 'All'}
                {t === 'dms' && (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <MessageSquare size={13} /> DMs
                  </span>
                )}
                {t === 'groups' && (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Users size={13} /> Groups
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Conversation list ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {/* Section label */}
          <div style={{ padding: '0.4rem 1.25rem 0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-label">
              {tab === 'all' ? 'Recent' : tab === 'dms' ? 'Direct Messages' : 'Group Chats'}
            </span>
            {totalUnread > 0 && (
              <span className="unread-count">{totalUnread}</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <Hash size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.88rem' }}>No conversations found</p>
              <button
                className="btn-secondary"
                style={{ marginTop: '1rem', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                onClick={() => setShowModal(true)}
              >
                <Plus size={14} /> Start a new chat
              </button>
            </div>
          ) : (
            filtered.map((conv, idx) => {
              const isActive = activeConvId === conv._id;
              const participantName = conv.isGroup
                ? null
                : conv.participants.find(p => p._id !== user?._id)?.name;
              const participantAvatar = conv.isGroup
                ? null
                : conv.participants.find(p => p._id !== user?._id)?.avatar;
              const displayTitle = conv.title || participantName || 'Unknown';
              const hasUnread = (conv.unreadCount || 0) > 0;

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConv(conv._id)}
                  className="animate-fade-in"
                  style={{
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    cursor: 'pointer',
                    background: isActive
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
                    transition: 'all var(--transition-fast)',
                    animationDelay: `${idx * 0.04}s`,
                    opacity: 0,
                    animationFillMode: 'forwards',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {conv.isGroup ? (
                      <div style={{
                        width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
                        background: isActive ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isActive ? 'white' : 'var(--accent-primary)',
                        border: '1px solid var(--border-light)',
                      }}>
                        <Users size={20} />
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={participantAvatar || `https://ui-avatars.com/api/?name=${displayTitle}&background=6366f1&color=fff`}
                          alt={displayTitle}
                          style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div className="status-indicator status-online" />
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '0.92rem',
                        fontWeight: hasUnread ? 700 : 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: hasUnread ? 'var(--text-primary)' : 'var(--text-primary)',
                      }}>
                        {displayTitle}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: '0.5rem' }}>
                        {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: hasUnread ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: hasUnread ? 500 : 'normal',
                        flex: 1,
                      }}>
                        {conv.lastMessage
                          ? (conv.lastMessage.senderId === user?._id
                            ? `You: ${conv.lastMessage.content}`
                            : conv.lastMessage.content)
                          : 'No messages yet'}
                      </p>

                      {/* Unread badge + Gemini badge */}
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexShrink: 0 }}>
                        {conv.isGroup && (
                          <span title="AI Summary available" style={{ color: 'var(--accent-secondary)', opacity: 0.7 }}>
                            <Sparkles size={12} />
                          </span>
                        )}
                        {hasUnread && (
                          <span className="unread-count">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Bottom: App branding ── */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--accent-gradient)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            ChatSphere <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>v1.0</span>
          </span>
        </div>
      </div>

      {/* New chat modal */}
      {showModal && (
        <NewChatModal
          onClose={() => setShowModal(false)}
          onConversationCreated={(id) => navigate(`/c/${id}`)}
        />
      )}
    </>
  );
};

export default Sidebar;
