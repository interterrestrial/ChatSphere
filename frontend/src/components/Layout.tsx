import { useParams } from 'react-router';
import Sidebar from './Sidebar.tsx';
import ChatArea from './ChatArea.tsx';

const Layout = () => {
  const { convId } = useParams();

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', padding: '1rem', gap: '1rem' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '350px', 
          borderRadius: 'var(--radius-xl)', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Sidebar activeConvId={convId} />
      </div>
      
      <div 
        className="glass-panel" 
        style={{ 
          flex: 1, 
          borderRadius: 'var(--radius-xl)', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {convId ? (
          <ChatArea convId={convId} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: 'var(--text-tertiary)' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: 'var(--radius-full)', 
              background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2>Select a conversation</h2>
            <p>Choose an existing chat or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
