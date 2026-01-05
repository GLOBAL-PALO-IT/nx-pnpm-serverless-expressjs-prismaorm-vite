import React, { useState } from 'react';
import { Post, CreatePostInput, UpdatePostInput } from '../services/api';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Label,
  Textarea,
} from '@nx-serverless/ui';

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{post ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange('title')}
              className={errors.title ? 'border-destructive' : ''}
              disabled={loading}
              required
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={handleChange('content')}
              disabled={loading}
              rows={6}
              placeholder="Write your post content here..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={handleChange('published')}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published
            </Label>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
