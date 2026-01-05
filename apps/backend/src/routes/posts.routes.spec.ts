import request from 'supertest';
import express from 'express';
import { postsRouter } from './posts.routes';
import { postService } from '@nx-serverless/services';
import { logger } from '../libs/logger';

// Mock dependencies
jest.mock('@nx-serverless/services', () => ({
  postService: {
    getAllPosts: jest.fn(),
    getPostById: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    togglePublishStatus: jest.fn(),
    getPostsByAuthor: jest.fn(),
    getPublishedPosts: jest.fn(),
  },
}));

jest.mock('../libs/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    http: jest.fn(),
  },
}));

// Mock middleware
jest.mock('../middleware/validation', () => ({
  validateBody: () => (req: any, res: any, next: any) => next(),
  validateParams: () => (req: any, res: any, next: any) => next(),
  validateQuery: () => (req: any, res: any, next: any) => next(),
  validateMultiple: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    next();
  },
}));

describe('posts routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/posts', postsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should get all posts with filters', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Test Post',
          content: 'Content',
          authorId: 'user-1',
        },
      ];
      (postService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
      expect(postService.getAllPosts).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: 'user-1' })
      );
    });

    it('should get posts with published filter', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Published Post',
          published: true,
          authorId: 'user-1',
        },
      ];
      (postService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      const response = await request(app).get('/api/posts?published=true');

      expect(response.status).toBe(200);
      expect(postService.getAllPosts).toHaveBeenCalledWith(
        expect.objectContaining({ published: true, authorId: 'user-1' })
      );
    });

    it('should get posts with search filter', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Searchable Post', authorId: 'user-1' },
      ];
      (postService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      const response = await request(app).get('/api/posts?search=searchable');

      expect(response.status).toBe(200);
      expect(postService.getAllPosts).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'searchable',
          authorId: 'user-1',
        })
      );
    });

    it('should handle errors', async () => {
      (postService.getAllPosts as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should use default error message and status code', async () => {
      // Create an error without message or statusCode properties
      const errorWithoutProps = Object.create(null);
      (postService.getAllPosts as jest.Mock).mockRejectedValue(
        errorWithoutProps
      );

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch posts');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get post by id', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'Test Post',
        content: 'Content',
        authorId: 'user-1',
      };
      (postService.getPostById as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app).get('/api/posts/post-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPost);
    });

    it('should return 404 when post not found', async () => {
      (postService.getPostById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/posts/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    it('should handle errors', async () => {
      (postService.getPostById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/posts/post-1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'New Post',
        content: 'Content',
        authorId: 'user-1',
      };
      (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'New Post', content: 'Content' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockPost);
      expect(postService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: 'user-1' })
      );
    });

    it('should create a post with published status', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'New Post',
        content: 'Content',
        published: true,
        authorId: 'user-1',
      };
      (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'New Post', content: 'Content', published: true });

      expect(response.status).toBe(201);
      expect(postService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ published: true })
      );
    });

    it('should default published to false', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'New Post',
        content: 'Content',
        published: false,
        authorId: 'user-1',
      };
      (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'New Post', content: 'Content' });

      expect(response.status).toBe(201);
      expect(postService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ published: false })
      );
    });

    it('should handle errors', async () => {
      (postService.createPost as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      );

      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'New Post', content: 'Content' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update own post', async () => {
      const existingPost = {
        id: 'post-1',
        title: 'Old Title',
        content: 'Old Content',
        authorId: 'user-1',
      };
      const updatedPost = {
        id: 'post-1',
        title: 'New Title',
        content: 'New Content',
        authorId: 'user-1',
      };
      (postService.getPostById as jest.Mock).mockResolvedValue(existingPost);
      (postService.updatePost as jest.Mock).mockResolvedValue(updatedPost);

      const response = await request(app)
        .put('/api/posts/post-1')
        .send({ title: 'New Title', content: 'New Content' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPost);
    });

    it('should return 404 when post not found', async () => {
      (postService.getPostById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/posts/nonexistent')
        .send({ title: 'New Title', content: 'New Content' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    it("should return 403 when updating another user's post", async () => {
      const existingPost = { id: 'post-1', title: 'Post', authorId: 'user-2' };
      (postService.getPostById as jest.Mock).mockResolvedValue(existingPost);

      const response = await request(app)
        .put('/api/posts/post-1')
        .send({ title: 'New Title', content: 'New Content' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'You can only update your own posts'
      );
    });

    it('should handle errors', async () => {
      (postService.getPostById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .put('/api/posts/post-1')
        .send({ title: 'New Title', content: 'New Content' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      const existingPost = { id: 'post-1', title: 'Post', authorId: 'user-1' };
      (postService.getPostById as jest.Mock).mockResolvedValue(existingPost);
      (postService.deletePost as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/api/posts/post-1');

      expect(response.status).toBe(204);
    });

    it('should return 404 when post not found', async () => {
      (postService.getPostById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/api/posts/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    it("should return 403 when deleting another user's post", async () => {
      const existingPost = { id: 'post-1', title: 'Post', authorId: 'user-2' };
      (postService.getPostById as jest.Mock).mockResolvedValue(existingPost);

      const response = await request(app).delete('/api/posts/post-1');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'You can only delete your own posts'
      );
    });

    it('should handle errors', async () => {
      (postService.getPostById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).delete('/api/posts/post-1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/posts/:id/toggle-publish', () => {
    it('should toggle publish status of own post', async () => {
      const existingPost = {
        id: 'post-1',
        title: 'Post',
        published: false,
        authorId: 'user-1',
      };
      const updatedPost = {
        id: 'post-1',
        title: 'Post',
        published: true,
        authorId: 'user-1',
      };
      (postService.getPostById as jest.Mock).mockResolvedValue(existingPost);
      (postService.togglePublishStatus as jest.Mock).mockResolvedValue(
        updatedPost
      );

      const response = await request(app).patch(
        '/api/posts/post-1/toggle-publish'
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPost);
    });

    it('should return 404 when post not found', async () => {
      (postService.getPostById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).patch(
        '/api/posts/nonexistent/toggle-publish'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    it("should return 403 when toggling another user's post", async () => {
      const existingPost = { id: 'post-1', title: 'Post', authorId: 'user-2' };
      (postService.getPostById as jest.Mock).mockResolvedValue(existingPost);

      const response = await request(app).patch(
        '/api/posts/post-1/toggle-publish'
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'You can only modify your own posts'
      );
    });

    it('should handle errors', async () => {
      (postService.getPostById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).patch(
        '/api/posts/post-1/toggle-publish'
      );

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/posts/author/:authorId', () => {
    it('should get posts by author', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Post 1', authorId: 'author-1' },
        { id: 'post-2', title: 'Post 2', authorId: 'author-1' },
      ];
      (postService.getPostsByAuthor as jest.Mock).mockResolvedValue(mockPosts);

      const response = await request(app).get('/api/posts/author/author-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
    });

    it('should handle errors', async () => {
      (postService.getPostsByAuthor as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/posts/author/author-1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/posts/published', () => {
    it('should get only published posts', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Published Post', published: true },
      ];
      (postService.getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);

      const response = await request(app).get('/api/posts/published');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
    });

    it('should handle errors', async () => {
      (postService.getPublishedPosts as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/posts/published');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
