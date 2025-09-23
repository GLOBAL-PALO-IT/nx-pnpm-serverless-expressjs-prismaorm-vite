import React, { useState } from 'react';
import { Post, CreatePostInput, UpdatePostInput } from '../services/api';
import styles from './PostForm.module.css';

interface PostFormProps {
  post?: Post;
  onSubmit: (data: CreatePostInput | UpdatePostInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function PostForm({
  post,
  onSubmit,
  onCancel,
  loading = false,
}: PostFormProps) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    published: post?.published || false,
  });

  const [errors, setErrors] = useState<{ title?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
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

    onSubmit(submitData);
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        e.target.type === 'checkbox'
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
