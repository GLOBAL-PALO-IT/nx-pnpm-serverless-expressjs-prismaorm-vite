import { postService } from './postService';
import { vi } from 'vitest';
import type { Post, CreatePostInput, UpdatePostInput } from './api';

describe('PostService', () => {
  let mockFetch: vi.Mock;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should fetch all posts without filters', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Content 1',
          published: true,
          authorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.getPosts();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });

    it('should fetch posts with published filter', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Published Post',
          published: true,
          authorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.getPosts({ published: true });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts?published=true',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });

    it('should fetch posts with published false filter', async () => {
      const mockPosts: Post[] = [
        {
          id: '2',
          title: 'Draft Post',
          published: false,
          authorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.getPosts({ published: false });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts?published=false',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });

    it('should fetch posts with search filter', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Searchable Post',
          published: true,
          authorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.getPosts({ search: 'Searchable' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts?search=Searchable',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });

    it('should fetch posts with both published and search filters', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Published Searchable Post',
          published: true,
          authorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.getPosts({
        published: true,
        search: 'Searchable',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts?published=true&search=Searchable',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });
  });

  describe('getPostById', () => {
    it('should fetch post by id', async () => {
      const mockPost: Post = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        published: true,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.getPostById('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe('getPostsByAuthor', () => {
    it('should fetch posts by author id', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Author Post 1',
          published: true,
          authorId: 'author1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Author Post 2',
          published: false,
          authorId: 'author1',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.getPostsByAuthor('author1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts/author/author1',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });
  });

  describe('getPublishedPosts', () => {
    it('should fetch only published posts', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Published Post',
          published: true,
          authorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.getPublishedPosts();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts/published',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });
  });

  describe('createPost', () => {
    it('should create post with all fields', async () => {
      const input: CreatePostInput = {
        title: 'New Post',
        content: 'New Content',
        published: true,
      };

      const mockPost: Post = {
        id: '1',
        ...input,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.createPost(input);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
        })
      );
      expect(result).toEqual(mockPost);
    });

    it('should create post with only title', async () => {
      const input: CreatePostInput = {
        title: 'New Post',
      };

      const mockPost: Post = {
        id: '1',
        title: input.title,
        published: false,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.createPost(input);

      expect(result).toEqual(mockPost);
    });
  });

  describe('updatePost', () => {
    it('should update post title', async () => {
      const input: UpdatePostInput = {
        title: 'Updated Title',
      };

      const mockPost: Post = {
        id: '1',
        title: input.title!,
        published: true,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.updatePost('1', input);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(input),
        })
      );
      expect(result).toEqual(mockPost);
    });

    it('should update post content', async () => {
      const input: UpdatePostInput = {
        content: 'Updated Content',
      };

      const mockPost: Post = {
        id: '1',
        title: 'Post',
        content: input.content,
        published: true,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.updatePost('1', input);

      expect(result).toEqual(mockPost);
    });

    it('should update post published status', async () => {
      const input: UpdatePostInput = {
        published: false,
      };

      const mockPost: Post = {
        id: '1',
        title: 'Post',
        published: input.published!,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.updatePost('1', input);

      expect(result).toEqual(mockPost);
    });

    it('should update multiple fields', async () => {
      const input: UpdatePostInput = {
        title: 'Updated Title',
        content: 'Updated Content',
        published: true,
      };

      const mockPost: Post = {
        id: '1',
        title: input.title!,
        content: input.content,
        published: input.published!,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.updatePost('1', input);

      expect(result).toEqual(mockPost);
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await postService.deletePost('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('togglePostPublishStatus', () => {
    it('should toggle post publish status', async () => {
      const mockPost: Post = {
        id: '1',
        title: 'Post',
        published: true,
        authorId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.togglePostPublishStatus('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts/1/toggle-publish',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe('searchPosts', () => {
    it('should search posts by term', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Searchable Post',
          published: true,
          authorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await postService.searchPosts('Searchable');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/posts?search=Searchable',
        expect.any(Object)
      );
      expect(result).toEqual(mockPosts);
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(postService.getPosts()).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Post not found' }),
      });

      await expect(postService.getPostById('999')).rejects.toThrow();
    });
  });
});
