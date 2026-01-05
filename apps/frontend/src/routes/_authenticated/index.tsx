import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';
import styles from '../../app/app.module.css';

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
});

function HomePage() {
  const [users, setUsers] = useState<any>(null);
  const [posts, setPosts] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await postService.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  return (
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
  );
}
