import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostList } from './PostList';
import type { Post } from '../services/api';

describe('PostList', () => {
  const mockPosts: Post[] = [
    {
      id: '1',
      title: 'First Post',
      content: 'This is the first post content',
      published: true,
      authorId: 'user1',
      author: {
        id: 'user1',
        email: 'author@example.com',
        name: 'John Doe',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Second Post',
      content:
        'This is a much longer content that needs to be truncated because it exceeds the maximum length that we want to display in the preview. This should be cut off at some point.',
      published: false,
      authorId: 'user2',
      author: {
        id: 'user2',
        email: 'author2@example.com',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
    {
      id: '3',
      title: 'Third Post',
      published: true,
      authorId: 'user3',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ];

  describe('rendering', () => {
    it('should render list of posts', () => {
      render(<PostList posts={mockPosts} />);

      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('Third Post')).toBeInTheDocument();
    });

    it('should render empty state when no posts', () => {
      render(<PostList posts={[]} />);

      expect(screen.getByText('No posts found.')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<PostList posts={[]} loading={true} />);

      expect(screen.getByText('Loading posts...')).toBeInTheDocument();
    });

    it('should show published status badge', () => {
      render(<PostList posts={mockPosts} />);

      expect(screen.getAllByText('✅ Published').length).toBe(2);
      expect(screen.getByText('📝 Draft')).toBeInTheDocument();
    });

    it('should render post content', () => {
      render(<PostList posts={mockPosts} />);

      expect(
        screen.getByText('This is the first post content')
      ).toBeInTheDocument();
    });

    it('should truncate long content', () => {
      render(<PostList posts={mockPosts} />);

      const truncatedContent = screen.getByText(
        /This is a much longer content/
      );
      expect(truncatedContent.textContent).toContain('...');
      expect(truncatedContent.textContent!.length).toBeLessThan(200);
    });

    it('should show author name when available', () => {
      render(<PostList posts={mockPosts} />);

      expect(screen.getByText('👤 John Doe')).toBeInTheDocument();
    });

    it('should show author email when name not available', () => {
      render(<PostList posts={mockPosts} />);

      expect(screen.getByText('👤 author2@example.com')).toBeInTheDocument();
    });

    it('should hide author when showAuthor is false', () => {
      render(<PostList posts={mockPosts} showAuthor={false} />);

      expect(screen.queryByText(/👤/)).not.toBeInTheDocument();
    });

    it('should not show author when author is missing', () => {
      render(<PostList posts={[mockPosts[2]]} />);

      expect(screen.queryByText(/👤/)).not.toBeInTheDocument();
    });

    it('should show created date', () => {
      render(<PostList posts={mockPosts} />);

      expect(screen.getAllByText(/📅/).length).toBeGreaterThan(0);
    });

    it('should show updated date when different from created date', () => {
      render(<PostList posts={mockPosts} />);

      expect(screen.getByText(/✏️ Updated/)).toBeInTheDocument();
    });

    it('should not show updated date when same as created date', () => {
      render(<PostList posts={[mockPosts[0]]} />);

      expect(screen.queryByText(/✏️ Updated/)).not.toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should call onEdit when edit button clicked', () => {
      const onEdit = vi.fn();
      render(<PostList posts={mockPosts} onEdit={onEdit} />);

      const editButtons = screen.getAllByTitle('Edit post');
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockPosts[0]);
    });

    it('should call onDelete when delete button clicked', () => {
      const onDelete = vi.fn();
      render(<PostList posts={mockPosts} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByTitle('Delete post');
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockPosts[0]);
    });

    it('should call onTogglePublish when toggle button clicked', () => {
      const onTogglePublish = vi.fn();
      render(<PostList posts={mockPosts} onTogglePublish={onTogglePublish} />);

      const toggleButtons = screen.getAllByRole('button', {
        name: /Unpublish|Publish/i,
      });
      fireEvent.click(toggleButtons[0]);

      expect(onTogglePublish).toHaveBeenCalledWith(mockPosts[0]);
    });

    it('should show Unpublish button for published posts', () => {
      render(<PostList posts={mockPosts} onTogglePublish={vi.fn()} />);

      expect(screen.getAllByText('👁️ Unpublish').length).toBeGreaterThan(0);
    });

    it('should show Publish button for draft posts', () => {
      render(<PostList posts={mockPosts} onTogglePublish={vi.fn()} />);

      expect(screen.getByText('🚀 Publish')).toBeInTheDocument();
    });

    it('should not show action buttons when callbacks not provided', () => {
      render(<PostList posts={mockPosts} />);

      expect(screen.queryByTitle('Edit post')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete post')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Publish/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      render(<PostList posts={mockPosts} />);

      const dateElements = screen.getAllByText(/Jan|Feb|Mar/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('truncateContent', () => {
    it('should not truncate short content', () => {
      const shortPost: Post = {
        ...mockPosts[0],
        content: 'Short',
      };

      render(<PostList posts={[shortPost]} />);

      expect(screen.getByText('Short')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('should handle undefined content', () => {
      const noContentPost: Post = {
        ...mockPosts[0],
        content: undefined,
      };

      render(<PostList posts={[noContentPost]} />);

      // Should render without crashing
      expect(screen.getByText('First Post')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle posts without content', () => {
      render(<PostList posts={[mockPosts[2]]} />);

      expect(screen.getByText('Third Post')).toBeInTheDocument();
    });

    it('should handle multiple posts with same properties', () => {
      const duplicatePosts = [mockPosts[0], mockPosts[0]];
      render(<PostList posts={duplicatePosts} />);

      const titles = screen.getAllByText('First Post');
      expect(titles.length).toBe(2);
    });

    it('should render with all callbacks provided', () => {
      const callbacks = {
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onTogglePublish: vi.fn(),
      };

      render(<PostList posts={mockPosts} {...callbacks} />);

      expect(screen.getAllByTitle('Edit post').length).toBe(3);
      expect(screen.getAllByTitle('Delete post').length).toBe(3);
    });
  });
});
