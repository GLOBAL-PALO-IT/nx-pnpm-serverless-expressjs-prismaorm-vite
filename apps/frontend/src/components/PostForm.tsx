import React, { useState } from 'react';
import { Post, User, CreatePostInput, UpdatePostInput } from '../services/api';
import styles from './PostForm.module.css';

interface PostFormProps {
  post?: Post;
  users: User[];
  onSubmit: (data: CreatePostInput | UpdatePostInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function PostForm({ post, users, onSubmit, onCancel, loading = false }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    published: post?.published || false,
    authorId: post?.authorId || '',
  });

  const [errors, setErrors] = useState<{ title?: string; authorId?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; authorId?: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.authorId && !post) {
      newErrors.authorId = 'Author is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreatePostInput | UpdatePostInput = {
      title: formData.title.trim(),
      content: formData.content.trim() || undefined,
      published: formData.published,
    };

    // Add authorId for new posts
    if (!post) {
      (submitData as CreatePostInput).authorId = formData.authorId;
    }

    onSubmit(submitData);
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.postForm}>
      <h3>{post ? 'Edit Post' : 'Create New Post'}</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={handleChange('title')}
          className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          disabled={loading}
          required
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="content" className={styles.label}>
          Content
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={handleChange('content')}
          className={styles.textarea}
          disabled={loading}
          rows={6}
          placeholder="Write your post content here..."
        />
      </div>

      {!post && (
        <div className={styles.formGroup}>
          <label htmlFor="authorId" className={styles.label}>
            Author *
          </label>
          <select
            id="authorId"
            value={formData.authorId}
            onChange={handleChange('authorId')}
            className={`${styles.select} ${errors.authorId ? styles.inputError : ''}`}
            disabled={loading}
            required
          >
            <option value="">Select an author</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
          {errors.authorId && <span className={styles.error}>{errors.authorId}</span>}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.published}
            onChange={handleChange('published')}
            className={styles.checkbox}
            disabled={loading}
          />
          <span className={styles.checkboxText}>Published</span>
        </label>
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={loading}
        >
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.button} ${styles.buttonSecondary}`}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
