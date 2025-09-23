import React from 'react';
import { Post } from '../services/api';
import styles from './PostList.module.css';

interface PostListProps {
  posts: Post[];
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onTogglePublish?: (post: Post) => void;
  loading?: boolean;
  showAuthor?: boolean;
}

export function PostList({ 
  posts, 
  onEdit, 
  onDelete, 
  onTogglePublish, 
  loading = false,
  showAuthor = true 
}: PostListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string | undefined, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No posts found.</p>
      </div>
    );
  }

  return (
    <div className={styles.postList}>
      {posts.map((post) => (
        <article key={post.id} className={styles.postCard}>
          <div className={styles.postHeader}>
            <h3 className={styles.postTitle}>{post.title}</h3>
            <div className={styles.postStatus}>
              <span className={`${styles.statusBadge} ${
                post.published ? styles.published : styles.draft
              }`}>
                {post.published ? '✅ Published' : '📝 Draft'}
              </span>
            </div>
          </div>

          {post.content && (
            <div className={styles.postContent}>
              <p>{truncateContent(post.content)}</p>
            </div>
          )}

          <div className={styles.postMeta}>
            {showAuthor && post.author && (
              <span className={styles.metaItem}>
                👤 {post.author.name || post.author.email}
              </span>
            )}
            <span className={styles.metaItem}>
              📅 {formatDate(post.createdAt)}
            </span>
            {post.updatedAt !== post.createdAt && (
              <span className={styles.metaItem}>
                ✏️ Updated {formatDate(post.updatedAt)}
              </span>
            )}
          </div>

          <div className={styles.postActions}>
            {onTogglePublish && (
              <button
                onClick={() => onTogglePublish(post)}
                className={`${styles.actionButton} ${styles.toggleButton}`}
                title={post.published ? 'Unpublish' : 'Publish'}
              >
                {post.published ? '👁️ Unpublish' : '🚀 Publish'}
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className={`${styles.actionButton} ${styles.editButton}`}
                title="Edit post"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post)}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Delete post"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
