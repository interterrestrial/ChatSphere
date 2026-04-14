import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { Sparkles, MessageSquare, Zap, Shield } from 'lucide-react';

const WELCOME_FEATURES = [
  { icon: <MessageSquare size={20} />, title: 'Real-time Messaging', desc: 'Zero-latency bidirectional communication via Socket.io.' },
  { icon: <Sparkles size={20} />, title: 'AI Smart Replies', desc: 'Gemini-powered suggestions to reply faster and smarter.' },
  { icon: <Zap size={20} />, title: 'Redis Caching', desc: 'Typing indicators & presence powered by Redis.' },
  { icon: <Shield size={20} />, title: 'Secure Auth', desc: 'Google OAuth 2.0 + JWT session management.' },
];

const WelcomeScreen = () => (
  <div
    className="animate-fade-in"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2.5rem',
      textAlign: 'center',
      gap: '0',
    }}
  >
    {/* Animated logo */}
    <div
      className="animate-float"
      style={{
        width: '80px', height: '80px',
        background: 'var(--accent-gradient)',
        borderRadius: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 0 40px rgba(99,102,241,0.35)',
      }}
    >
      <Sparkles size={36} color="white" />
    </div>

    <h2 style={{ fontSize: '1.7rem', marginBottom: '0.6rem', fontWeight: 700 }}>
      Welcome to <span className="text-gradient">ChatSphere</span>
    </h2>
    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.92rem', maxWidth: '360px', lineHeight: 1.65, marginBottom: '2.5rem' }}>
      Select a conversation from the sidebar to preview AI-powered messaging.
    </p>

    {/* Feature grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.85rem',
      width: '100%',
      maxWidth: '520px',
    }}>
      {WELCOME_FEATURES.map((f, i) => (
        <div
          key={i}
          className="glass-card animate-fade-in"
          style={{
            padding: '1.15rem',
            textAlign: 'left',
            animationDelay: `${i * 0.08}s`,
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--accent-soft)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-primary)',
            marginBottom: '0.65rem',
          }}>
            {f.icon}
          </div>
          <h4 style={{ fontSize: '0.88rem', margin: '0 0 0.25rem', fontWeight: 600 }}>{f.title}</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const Layout = () => {
  const { convId } = useParams();
  const { isLoading } = useSelector((state: RootState) => state.chat);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: '0.85rem',
        gap: '0.85rem',
        position: 'relative',
      }}
    >
      {/* Background orbs (in the layout layer) */}
      <div className="bg-orb bg-orb-1" style={{ zIndex: 0 }} />
      <div className="bg-orb bg-orb-2" style={{ zIndex: 0 }} />

      {/* Sidebar */}
      <div
        className="glass-panel"
        style={{
          width: '320px',
          minWidth: '280px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <Sidebar activeConvId={convId} />
      </div>

      {/* Main chat area */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          background: 'rgba(255,255,255,0.015)'
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
             <Sparkles size={24} className="animate-spin" style={{ opacity: 0.5 }} />
          </div>
        ) : convId ? (
          <ChatArea convId={convId} />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default Layout;
