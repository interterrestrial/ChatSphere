import { Routes, Route, Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from './store/index.ts';
import Layout from './components/Layout.tsx';
import AuthPage from './pages/AuthPage.tsx';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="app-container">
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        />
        <Route 
          path="/c/:convId" 
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
