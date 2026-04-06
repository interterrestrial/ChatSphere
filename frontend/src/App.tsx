import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import axios, { AxiosError } from 'axios';
import './App.css';

interface User {
  name: string;
  email?: string;
  isUsernameSet?: boolean;
  username?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

interface ErrorResponse {
  message?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [needsUsername, setNeedsUsername] = useState<boolean>(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AuthResponse>(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      
      const { user: loggedInUser, token } = response.data;
      
      // Save token (in a real app, maybe use more secure storage if required)
      localStorage.setItem('token', token);
      
      setUser(loggedInUser);
      
      if (!loggedInUser.isUsernameSet) {
        setNeedsUsername(true);
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(axiosError.response?.data?.message || 'Authentication failed');
      } else {
        setError('Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetUsername = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/choose-username`,
        { username: usernameInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { user: updatedUser, token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setUser(updatedUser);
      setNeedsUsername(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(axiosError.response?.data?.message || 'Failed to set username');
      } else {
        setError('Failed to set username');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNeedsUsername(false);
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <h1 className="logo-title">ChatSphere</h1>
        <p className="subtitle">Real-time intelligent conversations</p>
        
        {!user ? (
          <div className="auth-box">
            <h2>Welcome Back</h2>
            <p className="auth-description">Log in with Google to continue.</p>
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-state">Authenticating...</div>}
            
            <div className="google-btn-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
              />
            </div>
          </div>
        ) : (
          <div className="dashboard-box">
            <div className="user-profile">
              <div className="avatar">{user.name.charAt(0)}</div>
              <h2>Welcome, {user.name}</h2>
              {user.isUsernameSet ? (
                <span className="username-badge">@{user.username}</span>
              ) : null}
            </div>

            {needsUsername ? (
              <form onSubmit={handleSetUsername} className="username-form">
                <h3>Choose a Username</h3>
                <p>Complete your profile to start chatting.</p>
                {error && <div className="error-message">{error}</div>}
                <input
                  type="text"
                  placeholder="Enter a cool username..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  disabled={loading}
                  className="modern-input"
                />
                <button type="submit" disabled={loading || !usernameInput} className="primary-btn">
                  {loading ? 'Saving...' : 'Set Username'}
                </button>
              </form>
            ) : (
              <div className="success-state">
                <p>You are ready to enter the sphere.</p>
                <div className="dashboard-actions">
                  <button className="primary-btn" disabled>Enter Chat (Coming Soon)</button>
                  <button onClick={handleLogout} className="secondary-btn">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="ambient-sphere sphere-1"></div>
      <div className="ambient-sphere sphere-2"></div>
    </div>
  );
}

export default App;
