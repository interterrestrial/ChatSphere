import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser, registerUser, googleAuthUser } from '../store/authSlice.ts';
import type { AppDispatch, RootState } from '../store/index.ts';
import { LogIn, UserPlus, Mail, Lock, User, Sparkles, ArrowRight, Zap, Shield, MessageSquare } from 'lucide-react';

const GOOGLE_ICON = (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <path d="M47.532 24.552c0-1.636-.147-3.21-.41-4.728H24.48v9.218h12.94c-.572 2.972-2.24 5.488-4.732 7.176v5.916h7.64c4.476-4.12 7.204-10.192 7.204-17.582z" fill="#4285F4"/>
    <path d="M24.48 48c6.48 0 11.924-2.148 15.9-5.832l-7.64-5.916c-2.148 1.44-4.9 2.292-8.26 2.292-6.348 0-11.724-4.284-13.644-10.056H2.932v6.1C6.892 42.676 15.12 48 24.48 48z" fill="#34A853"/>
    <path d="M10.836 28.488A14.5 14.5 0 0 1 10.02 24c0-1.564.272-3.084.816-4.488v-6.1H2.932A23.96 23.96 0 0 0 .48 24c0 3.876.924 7.548 2.452 10.588l7.904-6.1z" fill="#FBBC05"/>
    <path d="M24.48 9.456c3.576 0 6.784 1.228 9.308 3.644l6.92-6.92C36.396 2.148 30.96 0 24.48 0 15.12 0 6.892 5.324 2.932 13.412l7.904 6.1C12.756 13.74 18.132 9.456 24.48 9.456z" fill="#EA4335"/>
  </svg>
);

const FEATURES = [
  { icon: <Zap size={18} />, label: 'Real-time messaging with Socket.io' },
  { icon: <Sparkles size={18} />, label: 'AI-powered smart replies via Gemini' },
  { icon: <Shield size={18} />, label: 'Secure Google OAuth + JWT auth' },
  { icon: <MessageSquare size={18} />, label: 'Group & direct conversations' },
];

const AuthPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await dispatch(loginUser({ identifier: email, password }));
    } else {
      await dispatch(registerUser({ name, email, password }));
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await dispatch(googleAuthUser({ token: tokenResponse.access_token }));
    },
    onError: error => console.error('Google Auth Failed', error)
  });

  return (
    <div
      className="app-container"
      style={{ alignItems: 'stretch', justifyContent: 'stretch', overflow: 'auto' }}
    >
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Left branding panel */}
      <div
        className="animate-slide-left"
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '3rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <div
            className="animate-pulse-glow"
            style={{
              width: '52px', height: '52px',
              background: 'var(--accent-gradient)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={26} color="white" />
          </div>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.8rem',
              fontWeight: 800,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ChatSphere
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            maxWidth: '480px',
          }}
        >
          The future of{' '}
          <span className="text-gradient">real-time</span>
          {' '}conversations.
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '420px',
            marginBottom: '2.5rem',
          }}
        >
          Experience lightning-fast messaging, AI-powered insights, and seamless collaboration — all in one beautifully crafted platform.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-pill animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
            >
              <span style={{ color: 'var(--accent-primary)' }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* Decorative chat bubble illustration */}
        <div
          className="animate-float"
          style={{
            position: 'absolute', bottom: '3rem', right: '-2rem',
            opacity: 0.12,
          }}
        >
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none">
            <path d="M10 20 Q10 10 20 10 H80 Q90 10 90 20 V60 Q90 70 80 70 H55 L40 85 L40 70 H20 Q10 70 10 60 Z"
              fill="url(#g1)" />
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Divider line */}
      <div
        style={{
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, var(--border-medium), transparent)',
          alignSelf: 'stretch',
          flexShrink: 0,
        }}
      />

      {/* Right auth panel */}
      <div
        className="animate-slide-right"
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 4rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '390px' }}>
          {/* Toggle heading */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>
              {isLogin ? 'Welcome back 👋' : 'Join ChatSphere'}
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              {isLogin
                ? 'Sign in to continue your conversations'
                : 'Create your account and start chatting'}
            </p>
          </div>

          {/* Google OAuth button */}
          <button
            className="btn-google"
            onClick={() => handleGoogleAuth()}
            disabled={isLoading}
            style={{ marginBottom: '1.5rem' }}
          >
            {GOOGLE_ICON}
            {isLogin ? 'Continue with Google' : 'Sign up with Google'}
          </button>

          <div className="divider" style={{ marginBottom: '1.5rem' }}>or</div>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="email"
                className="input-glass"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="password"
                className="input-glass"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>

            {isLogin && (
              <div style={{ textAlign: 'right' }}>
                <button type="button" style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: '0.25rem', height: '48px', width: '100%', fontSize: '0.95rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(p => !p)}
              style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.88rem' }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
