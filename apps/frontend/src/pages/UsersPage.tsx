import React, { useState, useEffect } from 'react';
import { User, CreateUserInput, UpdateUserInput, apiService } from '../services/api';
import { UserList } from '../components/UserList';
import { UserForm } from '../components/UserForm';
import styles from './UsersPage.module.css';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsers(true); // Include post count
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (data: CreateUserInput) => {
    try {
      setFormLoading(true);
      setError(null);
      await apiService.createUser(data);
      await loadUsers(); // Refresh the list
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserInput) => {
    if (!editingUser) return;
    
    try {
      setFormLoading(true);
      setError(null);
      await apiService.updateUser(editingUser.id, data);
      await loadUsers(); // Refresh the list
      setEditingUser(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name || user.email}? This will also delete all their posts.`)) {
      return;
    }

    try {
      setError(null);
      await apiService.deleteUser(user.id);
      await loadUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleViewPosts = (user: User) => {
    // Navigate to posts page with user filter
    // This would typically use React Router to navigate
    console.log('View posts for user:', user);
    // For now, just log - you can implement navigation later
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={loading}
          >
            ➕ Add User
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>❌ {error}</p>
          <button 
            onClick={() => setError(null)}
            className={styles.errorClose}
          >
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <div className={styles.formContainer}>
          <UserForm
            user={editingUser || undefined}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.statNumber}>{users.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Posts</h3>
          <p className={styles.statNumber}>
            {users.reduce((sum, user) => sum + (user._count?.posts || 0), 0)}
          </p>
        </div>
      </div>

      <div className={styles.listContainer}>
        <UserList
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onViewPosts={handleViewPosts}
          loading={loading}
        />
      </div>

      {!loading && filteredUsers.length === 0 && users.length > 0 && (
        <div className={styles.noResults}>
          <p>No users match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
