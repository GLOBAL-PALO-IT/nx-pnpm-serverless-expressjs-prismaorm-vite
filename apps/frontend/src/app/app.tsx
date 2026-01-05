import { Link, Outlet } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { rootService } from '../services/rootService';
import { useAuth } from '../contexts/AuthContext';
import styles from './app.module.css';

export function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const { user, logout } = useAuth();

  useEffect(() => {
    // Test API connectivity
    const testApi = async () => {
      try {
        const health = await rootService.getHealthCheck();
        setApiStatus('Connected ✅');
        console.log('API Health:', health);
      } catch (error) {
        setApiStatus('Disconnected ❌');
        console.error('API Error:', error);
      }
    };

    testApi();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Nx Serverless Monorepo</h1>
            <p>React Frontend + Express Serverless Backend</p>
            <div className={styles.status}>
              Backend Status:{' '}
              <span className={styles.statusText}>{apiStatus}</span>
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
        <Link to="/" className={styles.navLink}>
          Home
        </Link>
        <Link to="/users" className={styles.navLink}>
          Users
        </Link>
        <Link to="/posts" className={styles.navLink}>
          Posts
        </Link>
        <Link to="/ui-demo" className={styles.navLink}>
          UI Demo
        </Link>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
