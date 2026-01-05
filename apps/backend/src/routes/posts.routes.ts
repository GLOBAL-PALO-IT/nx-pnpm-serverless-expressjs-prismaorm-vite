import { Router } from 'express';
import { postService } from '@nx-serverless/services';
import {
  validateBody,
  validateParams,
  validateQuery,
  validateMultiple,
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../libs/logger';
import {
  CreatePostSchema,
  UpdatePostSchema,
  PostIdSchema,
  AuthorIdSchema,
  PostQuerySchema,
} from '@nx-serverless/types';

const router = Router();

// Error handler helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleError = (
  res: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  defaultMessage = 'Internal server error'
) => {
  logger.error('API Error:', error);
  const message = error.message || defaultMessage;
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ error: message });
};

// GET /api/posts/published - Get only published posts (protected)
// IMPORTANT: This must come before /:id route to avoid route matching conflict
router.get('/published', authenticateToken, async (req, res) => {
  try {
    const posts = await postService.getPublishedPosts();
    res.json(posts);
  } catch (error) {
    handleError(res, error, 'Failed to fetch published posts');
  }
});

// GET /api/posts - Get all posts with optional filters (protected)
router.get(
  '/',
  authenticateToken,
  validateQuery(PostQuerySchema),
  async (req, res) => {
    try {
      const { published, search } = req.query;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: any = {};
      if (published !== undefined) {
        // Convert string query param to boolean
        filters.published = String(published) === 'true';
      }
      // Always filter by current authenticated user
      filters.authorId = req.user!.id;
      if (search) {
        filters.searchTerm = search;
      }

      const posts = await postService.getAllPosts(filters);
      res.json(posts);
    } catch (error) {
      handleError(res, error, 'Failed to fetch posts');
    }
  }
);

// GET /api/posts/:id - Get post by ID (protected)
router.get(
  '/:id',
  authenticateToken,
  validateParams(PostIdSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      handleError(res, error, 'Failed to fetch post');
    }
  }
);

// POST /api/posts - Create a new post (protected)
router.post(
  '/',
  authenticateToken,
  validateBody(CreatePostSchema),
  async (req, res) => {
    try {
      const { title, content, published } = req.body;

      // Use the authenticated user as the author
      const post = await postService.createPost({
        title,
        content,
        published: published ?? false,
        authorId: req.user!.id,
      });
      res.status(201).json(post);
    } catch (error) {
      handleError(res, error, 'Failed to create post');
    }
  }
);

// PUT /api/posts/:id - Update post (protected - author only)
router.put(
  '/:id',
  authenticateToken,
  validateMultiple({
    params: PostIdSchema,
    body: UpdatePostSchema,
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, published } = req.body;

      // Check if the post exists and user is the author
      const existingPost = await postService.getPostById(id);
      if (!existingPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (existingPost.authorId !== req.user!.id) {
        return res
          .status(403)
          .json({ error: 'You can only update your own posts' });
      }

      const post = await postService.updatePost(id, {
        title,
        content,
        published,
      });
      res.json(post);
    } catch (error) {
      handleError(res, error, 'Failed to update post');
    }
  }
);

// DELETE /api/posts/:id - Delete post (protected - author only)
router.delete(
  '/:id',
  authenticateToken,
  validateParams(PostIdSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if the post exists and user is the author
      const existingPost = await postService.getPostById(id);
      if (!existingPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (existingPost.authorId !== req.user!.id) {
        return res
          .status(403)
          .json({ error: 'You can only delete your own posts' });
      }

      await postService.deletePost(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error, 'Failed to delete post');
    }
  }
);

// PATCH /api/posts/:id/toggle-publish - Toggle post publish status (protected - author only)
router.patch(
  '/:id/toggle-publish',
  authenticateToken,
  validateParams(PostIdSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if the post exists and user is the author
      const existingPost = await postService.getPostById(id);
      if (!existingPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (existingPost.authorId !== req.user!.id) {
        return res
          .status(403)
          .json({ error: 'You can only modify your own posts' });
      }

      const post = await postService.togglePublishStatus(id);
      res.json(post);
    } catch (error) {
      handleError(res, error, 'Failed to toggle post publish status');
    }
  }
);

// GET /api/posts/author/:authorId - Get posts by author (protected)
router.get(
  '/author/:authorId',
  authenticateToken,
  validateParams(AuthorIdSchema),
  async (req, res) => {
    try {
      const { authorId } = req.params;
      const posts = await postService.getPostsByAuthor(authorId);
      res.json(posts);
    } catch (error) {
      handleError(res, error, 'Failed to fetch posts by author');
    }
  }
);

export { router as postsRouter };
