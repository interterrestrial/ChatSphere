import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Search, Users, MessageSquare, Plus, UserPlus } from 'lucide-react';
import { setConversations } from '../store/chatSlice.ts';
import type { RootState } from '../store/index.ts';
import type { Conversation } from '../store/chatSlice.ts';

interface NewChatModalProps {
  onClose: () => void;
  onConversationCreated: (convId: string) => void;
}

const MOCK_CONTACTS = [
  { _id: 'u2', name: 'Sarah Smith',  avatar: 'https://i.pravatar.cc/150?u=u2', role: 'Developer' },
  { _id: 'u3', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=u3', role: 'Designer' },
  { _id: 'u4', name: 'Mike Chen',    avatar: 'https://i.pravatar.cc/150?u=u4', role: 'Product Manager' },
  { _id: 'u5', name: 'Emma Wilson',  avatar: 'https://i.pravatar.cc/150?u=u5', role: 'UX Researcher' },
  { _id: 'u6', name: 'Ryan Park',    avatar: 'https://i.pravatar.cc/150?u=u6', role: 'DevOps Engineer' },
  { _id: 'u7', name: 'Priya Nair',   avatar: 'https://i.pravatar.cc/150?u=u7', role: 'Data Scientist' },
];

type Tab = 'dm' | 'group';

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onConversationCreated }) => {
  const dispatch = useDispatch();
  const { conversations } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  const [tab, setTab] = useState<Tab>('dm');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const filtered = MOCK_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    if (tab === 'dm') {
      setSelectedIds(prev => prev.includes(id) ? [] : [id]);
    } else {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  const handleCreate = () => {
    if (selectedIds.length === 0) return;

    const selectedContacts = MOCK_CONTACTS.filter(c => selectedIds.includes(c._id));
    const now = new Date().toISOString();

    const newConv: Conversation = {
      _id: `c_new_${Date.now()}`,
      title: tab === 'group' ? (groupName.trim() || 'New Group') : null,
      isGroup: tab === 'group',
      participants: [
        { _id: user!._id, name: user!.name, avatar: user!.avatar },
        ...selectedContacts.map(c => ({ _id: c._id, name: c.name, avatar: c.avatar })),
      ],
      lastMessage: null,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    dispatch(setConversations([newConv, ...conversations]));
    onConversationCreated(newConv._id);
    onClose();
  };

  const canCreate = selectedIds.length > 0 && (tab === 'dm' || (tab === 'group' && selectedIds.length >= 1));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>New Conversation</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Start a DM or create a group
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs-container" style={{ marginBottom: '1.25rem' }}>
          <button
            className={`tab-btn ${tab === 'dm' ? 'active' : ''}`}
            onClick={() => { setTab('dm'); setSelectedIds([]); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <MessageSquare size={14} /> Direct Message
            </span>
          </button>
          <button
            className={`tab-btn ${tab === 'group' ? 'active' : ''}`}
            onClick={() => { setTab('group'); setSelectedIds([]); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Users size={14} /> Group Chat
            </span>
          </button>
        </div>

        {/* Group name input */}
        {tab === 'group' && (
          <div style={{ marginBottom: '1rem' }}>
            <input
              className="input-glass"
              placeholder="Group name (e.g. Design Team)…"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
          <Search size={16} style={{
            position: 'absolute', left: '1rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
          }} />
          <input
            className="input-glass"
            placeholder="Search people…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        {/* Selected badges (group mode) */}
        {tab === 'group' && selectedIds.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {MOCK_CONTACTS.filter(c => selectedIds.includes(c._id)).map(c => (
              <span key={c._id} className="chip active" onClick={() => toggleSelect(c._id)}>
                <img src={c.avatar} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                {c.name.split(' ')[0]}
                <X size={12} />
              </span>
            ))}
          </div>
        )}

        {/* Contacts list */}
        <div style={{ maxHeight: '260px', overflowY: 'auto', marginBottom: '1.25rem' }}>
          {filtered.map(contact => {
            const isSelected = selectedIds.includes(contact._id);
            return (
              <div
                key={contact._id}
                onClick={() => toggleSelect(contact._id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent-soft)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-accent)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  marginBottom: '0.25rem',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={contact.avatar} alt={contact.name} className="avatar avatar-md" />
                  <div className="status-indicator status-online" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{contact.name}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{contact.role}</p>
                </div>
                {isSelected && (
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Plus size={13} color="white" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create button */}
        <button
          className="btn-primary"
          style={{ width: '100%', opacity: canCreate ? 1 : 0.45 }}
          onClick={handleCreate}
          disabled={!canCreate}
        >
          <UserPlus size={18} />
          {tab === 'dm'
            ? `Start Chat${selectedIds.length ? ` with ${MOCK_CONTACTS.find(c => c._id === selectedIds[0])?.name.split(' ')[0]}` : ''}`
            : `Create Group${selectedIds.length > 0 ? ` (${selectedIds.length + 1} members)` : ''}`
          }
        </button>
      </div>
    </div>
  );
};

export default NewChatModal;
