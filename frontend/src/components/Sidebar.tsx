import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '../store/index.ts';
import { logout } from '../store/authSlice.ts';
import { Search, Plus, MessageSquare, Users, LogOut } from 'lucide-react';

interface SidebarProps {
  activeConvId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeConvId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.chat);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ position: 'relative' }}>
               <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} alt="Profile" className="avatar avatar-md" />
               <div className="status-indicator status-online"></div>
             </div>
             <div>
               <h3 style={{ fontSize: '1rem', margin: 0 }}>{user?.name}</h3>
               <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Online</span>
             </div>
          </div>
          <button className="btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              className="input-glass" 
              placeholder="Search or start new..." 
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingBottom: '0.6rem', paddingTop: '0.6rem', borderRadius: 'var(--radius-full)' }}
            />
          </div>
          <button className="btn-primary" style={{ padding: '0.6rem', borderRadius: 'var(--radius-full)' }}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }} className="custom-scroll">
        <div style={{ padding: '0 1.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Chats
        </div>
        
        {conversations.map((conv) => {
          const isActive = activeConvId === conv._id;
          const participantName = conv.isGroup ? null : conv.participants.find(p => p._id !== user?._id)?.name;
          const displayTitle = conv.title || participantName || 'Unknown';
          
          return (
            <div 
              key={conv._id}
              onClick={() => navigate(`/c/${conv._id}`)}
              style={{ 
                padding: '1rem 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                cursor: 'pointer',
                background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderLeft: `3px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)' }}
              onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                {conv.isGroup ? <Users size={24} /> : <MessageSquare size={24} />}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayTitle}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: conv.lastMessage?.isRead ? 'var(--text-tertiary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: conv.lastMessage?.isRead ? 'normal' : 600 }}>
                  {conv.lastMessage ? (conv.lastMessage.senderId === user?._id ? `You: ${conv.lastMessage.content}` : conv.lastMessage.content) : 'No messages yet'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
