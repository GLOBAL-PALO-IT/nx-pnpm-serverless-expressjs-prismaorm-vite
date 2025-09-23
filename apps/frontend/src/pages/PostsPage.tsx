import React, { useState, useEffect } from 'react';
import { Post, User, CreatePostInput, UpdatePostInput, PostFilters, apiService } from '../services/api';
import { PostList } from '../components/PostList';
import { PostForm } from '../components/PostForm';
import styles from './PostsPage.module.css';

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: PostFilters = {};
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (selectedAuthor) {
        filters.authorId = selectedAuthor;
      }
      
      if (publishedFilter !== 'all') {
        filters.published = publishedFilter === 'published';
      }

      const data = await apiService.getPosts(filters);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [searchTerm, selectedAuthor, publishedFilter]);

  const handleCreatePost = async (data: CreatePostInput) => {
    try {
      setFormLoading(true);
      setError(null);
      await apiService.createPost(data);
      await loadPosts(); // Refresh the list
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePost = async (data: UpdatePostInput) => {
    if (!editingPost) return;
    
    try {
      setFormLoading(true);
      setError(null);
      await apiService.updatePost(editingPost.id, data);
      await loadPosts(); // Refresh the list
      setEditingPost(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      setError(null);
      await apiService.deletePost(post.id);
      await loadPosts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      setError(null);
      await apiService.togglePostPublishStatus(post.id);
      await loadPosts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle post status');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAuthor('');
    setPublishedFilter('all');
  };

  const publishedPosts = posts.filter(post => post.published);
  const draftPosts = posts.filter(post => !post.published);

  return (
    <div className={styles.postsPage}>
      <div className={styles.header}>
        <h1>Post Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={loading || users.length === 0}
        >
          ➕ Add Post
        </button>
      </div>

      {users.length === 0 && !loading && (
        <div className={styles.warning}>
          <p>⚠️ You need to create users first before you can create posts.</p>
        </div>
      )}

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
          <PostForm
            post={editingPost || undefined}
            users={users}
            onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All authors</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value as 'all' | 'published' | 'draft')}
            className={styles.filterSelect}
          >
            <option value="all">All posts</option>
            <option value="published">Published only</option>
            <option value="draft">Drafts only</option>
          </select>
        </div>

        {(searchTerm || selectedAuthor || publishedFilter !== 'all') && (
          <button
            onClick={clearFilters}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Posts</h3>
          <p className={styles.statNumber}>{posts.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Published</h3>
          <p className={styles.statNumber}>{publishedPosts.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Drafts</h3>
          <p className={styles.statNumber}>{draftPosts.length}</p>
        </div>
      </div>

      <div className={styles.listContainer}>
        <PostList
          posts={posts}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onTogglePublish={handleTogglePublish}
          loading={loading}
          showAuthor={!selectedAuthor}
        />
      </div>

      {!loading && posts.length === 0 && (
        <div className={styles.noResults}>
          <p>No posts found.</p>
          {(searchTerm || selectedAuthor || publishedFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Clear filters to see all posts
            </button>
          )}
        </div>
      )}
    </div>
  );
}
