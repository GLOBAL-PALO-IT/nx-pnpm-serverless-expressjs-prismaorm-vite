import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Nx Serverless Backend!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
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

// Import validation middleware and schemas
import { validateBody, validateParams, validateQuery, validateMultiple } from './middleware/validation';
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
} from './schemas';

// Error handler helper
const handleError = (res: express.Response, error: any, defaultMessage = 'Internal server error') => {
  console.error('API Error:', error);
  const message = error.message || defaultMessage;
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ error: message });
};

// User Routes
// GET /api/users - Get all users
app.get('/api/users', validateQuery(UserQuerySchema), async (req, res) => {
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

// GET /api/users/:id - Get user by ID
app.get('/api/users/:id', validateParams(UserIdSchema), async (req, res) => {
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

// POST /api/users - Create a new user
app.post('/api/users', validateBody(CreateUserSchema), async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await userService.createUser({ email, name });
    res.status(201).json(user);
  } catch (error) {
    handleError(res, error, 'Failed to create user');
  }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', 
  validateMultiple({
    params: UserIdSchema,
    body: UpdateUserSchema
  }), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      const user = await userService.updateUser(id, { email, name });
      res.json(user);
    } catch (error) {
      handleError(res, error, 'Failed to update user');
    }
  }
);

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', validateParams(UserIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete user');
  }
});

// GET /api/users/email/:email - Get user by email
app.get('/api/users/email/:email', validateParams(UserEmailSchema), async (req, res) => {
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
// GET /api/posts - Get all posts with optional filters
app.get('/api/posts', validateQuery(PostQuerySchema), async (req, res) => {
  try {
    const { published, authorId, search } = req.query;
    
    const filters: any = {};
    if (published !== undefined) {
      filters.published = published;
    }
    if (authorId) {
      filters.authorId = authorId;
    }
    if (search) {
      filters.searchTerm = search;
    }

    const posts = await postService.getAllPosts(filters);
    res.json(posts);
  } catch (error) {
    handleError(res, error, 'Failed to fetch posts');
  }
});

// GET /api/posts/:id - Get post by ID
app.get('/api/posts/:id', validateParams(PostIdSchema), async (req, res) => {
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

// POST /api/posts - Create a new post
app.post('/api/posts', validateBody(CreatePostSchema), async (req, res) => {
  try {
    const { title, content, published, authorId } = req.body;

    const post = await postService.createPost({
      title,
      content,
      published,
      authorId,
    });
    res.status(201).json(post);
  } catch (error) {
    handleError(res, error, 'Failed to create post');
  }
});

// PUT /api/posts/:id - Update post
app.put('/api/posts/:id',
  validateMultiple({
    params: PostIdSchema,
    body: UpdatePostSchema
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, published } = req.body;

      const post = await postService.updatePost(id, { title, content, published });
      res.json(post);
    } catch (error) {
      handleError(res, error, 'Failed to update post');
    }
  }
);

// DELETE /api/posts/:id - Delete post
app.delete('/api/posts/:id', validateParams(PostIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    await postService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete post');
  }
});

// PATCH /api/posts/:id/toggle-publish - Toggle post publish status
app.patch('/api/posts/:id/toggle-publish', validateParams(PostIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postService.togglePublishStatus(id);
    res.json(post);
  } catch (error) {
    handleError(res, error, 'Failed to toggle post publish status');
  }
});

// GET /api/posts/author/:authorId - Get posts by author
app.get('/api/posts/author/:authorId', validateParams(AuthorIdSchema), async (req, res) => {
  try {
    const { authorId } = req.params;
    const posts = await postService.getPostsByAuthor(authorId);
    res.json(posts);
  } catch (error) {
    handleError(res, error, 'Failed to fetch posts by author');
  }
});

// GET /api/posts/published - Get only published posts
app.get('/api/posts/published', async (req, res) => {
  try {
    const posts = await postService.getPublishedPosts();
    res.json(posts);
  } catch (error) {
    handleError(res, error, 'Failed to fetch published posts');
  }
});

export { app };
