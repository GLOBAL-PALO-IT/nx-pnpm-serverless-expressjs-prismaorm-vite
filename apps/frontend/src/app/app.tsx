import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { UsersPage } from '../pages/UsersPage';
import { PostsPage } from '../pages/PostsPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import styles from './app.module.css';

export function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [users, setUsers] = useState<any>(null);
  const [posts, setPosts] = useState<any>(null);
  
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // Test API connectivity
    const testApi = async () => {
      try {
        const health = await apiService.getHealthCheck();
        setApiStatus('Connected ✅');
        console.log('API Health:', health);
      } catch (error) {
        setApiStatus('Disconnected ❌');
        console.error('API Error:', error);
      }
    };

    testApi();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await apiService.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading screen while authentication is being determined
  if (isLoading) {
    return (
      <div className={styles.app}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // If not authenticated, show login page for all routes except login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Nx Serverless Monorepo</h1>
            <p>React Frontend + Express Serverless Backend</p>
            <div className={styles.status}>
              Backend Status: <span className={styles.statusText}>{apiStatus}</span>
            </div>
          </div>
          <div className={styles.userSection}>
            <span className={styles.welcomeText}>
              Welcome, {user?.name || user?.email}!
            </span>
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/users" className={styles.navLink}>Users</Link>
        <Link to="/posts" className={styles.navLink}>Posts</Link>
      </nav>

      <main className={styles.main}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className={styles.page}>
                  <h2>Welcome to the Nx Serverless Monorepo</h2>
                  <p>This is a full-stack TypeScript application with:</p>
                  <ul className={styles.featureList}>
                    <li>✅ Nx monorepo structure</li>
                    <li>✅ React frontend with Vite</li>
                    <li>✅ Express.js backend with Serverless Framework</li>
                    <li>✅ Prisma ORM with PostgreSQL</li>
                    <li>✅ TypeScript everywhere</li>
                    <li>✅ ESLint + Prettier</li>
                    <li>✅ JWT Authentication</li>
                  </ul>
                  <div className={styles.actions}>
                    <button onClick={fetchUsers} className={styles.button}>
                      Test Users API
                    </button>
                    <button onClick={fetchPosts} className={styles.button}>
                      Test Posts API
                    </button>
                  </div>
                  {users && (
                    <div className={styles.result}>
                      <h3>Users Response:</h3>
                      <pre>{JSON.stringify(users, null, 2)}</pre>
                    </div>
                  )}
                  {posts && (
                    <div className={styles.result}>
                      <h3>Posts Response:</h3>
                      <pre>{JSON.stringify(posts, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <PostsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
