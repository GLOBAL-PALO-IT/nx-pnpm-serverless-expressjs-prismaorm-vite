import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './libs/logger';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({ 
    message: 'Hello from Nx Serverless Backend!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes will be added here
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API endpoint working!',
    data: { test: true }
  });
});

// Import services
import { userService } from './services/userService';
import { postService } from './services/postService';
import { authService } from './services/authService';

// Import validation middleware and schemas
import { validateBody, validateParams, validateQuery, validateMultiple } from './middleware/validation';
import { authenticateToken, optionalAuthentication } from './middleware/auth';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserIdSchema,
  UserEmailSchema,
  UserQuerySchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostIdSchema,
  AuthorIdSchema,
  PostQuerySchema,
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  LogoutSchema,
} from './schemas';

// Error handler helper
const handleError = (res: express.Response, error: any, defaultMessage = 'Internal server error') => {
  logger.error('API Error:', error);
  const message = error.message || defaultMessage;
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ error: message });
};

// Authentication Routes
// POST /auth/register - Register a new user
app.post('/auth/register', validateBody(RegisterSchema), async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const result = await authService.register({ email, name, password });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 'Registration failed');
  }
});

// POST /auth/login - Login user
app.post('/auth/login', validateBody(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Login failed');
  }
});

// POST /auth/refresh - Refresh access token
app.post('/auth/refresh', validateBody(RefreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json({ tokens });
  } catch (error) {
    handleError(res, error, 'Token refresh failed');
  }
});

// POST /auth/logout - Logout user
app.post('/auth/logout', validateBody(LogoutSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    handleError(res, error, 'Logout failed');
  }
});

// GET /auth/me - Get current user info (protected route)
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    res.json({ user: req.user });
  } catch (error) {
    handleError(res, error, 'Failed to get user info');
  }
});

// User Routes
// GET /api/users - Get all users (protected)
app.get('/api/users', authenticateToken, validateQuery(UserQuerySchema), async (req, res) => {
  try {
    const { includePostCount } = req.query;
    const users = includePostCount 
      ? await userService.getUsersWithPostCount()
      : await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    handleError(res, error, 'Failed to fetch users');
  }
});

// GET /api/users/:id - Get user by ID (protected)
app.get('/api/users/:id', authenticateToken, validateParams(UserIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    handleError(res, error, 'Failed to fetch user');
  }
});

// POST /api/users - Create a new user (protected - admin only)
app.post('/api/users', authenticateToken, validateBody(CreateUserSchema), async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await userService.createUser({ email, name });
    res.status(201).json(user);
  } catch (error) {
    handleError(res, error, 'Failed to create user');
  }
});

// PUT /api/users/:id - Update user (protected - own profile only)
app.put('/api/users/:id', 
  authenticateToken,
  validateMultiple({
    params: UserIdSchema,
    body: UpdateUserSchema
  }), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      // Check if user is updating their own profile
      if (req.user!.id !== id) {
        return res.status(403).json({ error: 'You can only update your own profile' });
      }

      const user = await userService.updateUser(id, { email, name });
      res.json(user);
    } catch (error) {
      handleError(res, error, 'Failed to update user');
    }
  }
);

// DELETE /api/users/:id - Delete user (protected - own profile only)
app.delete('/api/users/:id', authenticateToken, validateParams(UserIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is deleting their own profile
    if (req.user!.id !== id) {
      return res.status(403).json({ error: 'You can only delete your own profile' });
    }

    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete user');
  }
});

// GET /api/users/email/:email - Get user by email (protected)
app.get('/api/users/email/:email', authenticateToken, validateParams(UserEmailSchema), async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    handleError(res, error, 'Failed to fetch user by email');
  }
});

// Post Routes
// GET /api/posts - Get all posts with optional filters (protected)
app.get('/api/posts', authenticateToken, validateQuery(PostQuerySchema), async (req, res) => {
  try {
    const { published, search } = req.query;
    
    const filters: any = {};
    if (published !== undefined) {
      filters.published = published;
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
});

// GET /api/posts/:id - Get post by ID (protected)
app.get('/api/posts/:id', authenticateToken, validateParams(PostIdSchema), async (req, res) => {
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
});

// POST /api/posts - Create a new post (protected)
app.post('/api/posts', authenticateToken, validateBody(CreatePostSchema), async (req, res) => {
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
});

// PUT /api/posts/:id - Update post (protected - author only)
app.put('/api/posts/:id',
  authenticateToken,
  validateMultiple({
    params: PostIdSchema,
    body: UpdatePostSchema
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
        return res.status(403).json({ error: 'You can only update your own posts' });
      }

      const post = await postService.updatePost(id, { title, content, published });
      res.json(post);
    } catch (error) {
      handleError(res, error, 'Failed to update post');
    }
  }
);

// DELETE /api/posts/:id - Delete post (protected - author only)
app.delete('/api/posts/:id', authenticateToken, validateParams(PostIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the post exists and user is the author
    const existingPost = await postService.getPostById(id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await postService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete post');
  }
});

// PATCH /api/posts/:id/toggle-publish - Toggle post publish status (protected - author only)
app.patch('/api/posts/:id/toggle-publish', authenticateToken, validateParams(PostIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the post exists and user is the author
    const existingPost = await postService.getPostById(id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only modify your own posts' });
    }

    const post = await postService.togglePublishStatus(id);
    res.json(post);
  } catch (error) {
    handleError(res, error, 'Failed to toggle post publish status');
  }
});

// GET /api/posts/author/:authorId - Get posts by author (protected)
app.get('/api/posts/author/:authorId', authenticateToken, validateParams(AuthorIdSchema), async (req, res) => {
  try {
    const { authorId } = req.params;
    const posts = await postService.getPostsByAuthor(authorId);
    res.json(posts);
  } catch (error) {
    handleError(res, error, 'Failed to fetch posts by author');
  }
});

// GET /api/posts/published - Get only published posts (protected)
app.get('/api/posts/published', authenticateToken, async (req, res) => {
  try {
    const posts = await postService.getPublishedPosts();
    res.json(posts);
  } catch (error) {
    handleError(res, error, 'Failed to fetch published posts');
  }
});

export { app };
