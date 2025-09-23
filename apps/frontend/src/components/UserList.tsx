import React from 'react';
import { User } from '../services/api';
import styles from './UserList.module.css';

interface UserListProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewPosts?: (user: User) => void;
  loading?: boolean;
}

export function UserList({ users, onEdit, onDelete, onViewPosts, loading = false }: UserListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div className={styles.userList}>
      {users.map((user) => (
        <div key={user.id} className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.userHeader}>
              <h3 className={styles.userName}>
                {user.name || 'Unnamed User'}
              </h3>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            
            <div className={styles.userMeta}>
              <span className={styles.metaItem}>
                Created: {formatDate(user.createdAt)}
              </span>
              {user._count && (
                <span className={styles.metaItem}>
                  Posts: {user._count.posts}
                </span>
              )}
            </div>
          </div>

          <div className={styles.userActions}>
            {onViewPosts && (
              <button
                onClick={() => onViewPosts(user)}
                className={`${styles.actionButton} ${styles.viewButton}`}
                title="View posts"
              >
                📝 Posts
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(user)}
                className={`${styles.actionButton} ${styles.editButton}`}
                title="Edit user"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(user)}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Delete user"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
