import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import { LogIn, Sparkles } from 'lucide-react';

const AuthPage = () => {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful Google OAuth / JWT Auth as per architecture
    dispatch(setUser({
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://i.pravatar.cc/150?u=u1'
    }));
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '1rem', 
            background: 'var(--accent-gradient)',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ChatSphere</h1>
          <p style={{ color: 'var(--text-tertiary)' }}>Sign in to real-time AI conversations</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div>
              <input type="text" className="input-glass" placeholder="Full Name" required />
            </div>
          )}
          <div>
            <input type="email" className="input-glass" placeholder="Email Address" required />
          </div>
          <div>
            <input type="password" className="input-glass" placeholder="Password" required />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
            <LogIn size={20} />
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            type="button"
            className="btn-icon" 
            style={{ width: 'auto', padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
