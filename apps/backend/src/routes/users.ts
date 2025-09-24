import { Router } from 'express';
import { userService } from '../services/userService';
import {
  validateBody,
  validateParams,
  validateQuery,
  validateMultiple,
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../libs/logger';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserIdSchema,
  UserEmailSchema,
  UserQuerySchema,
} from '../schemas';

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

// GET /api/users - Get all users (protected)
router.get(
  '/',
  authenticateToken,
  validateQuery(UserQuerySchema),
  async (req, res) => {
    try {
      const { includePostCount } = req.query;
      const users = includePostCount
        ? await userService.getUsersWithPostCount()
        : await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error, 'Failed to fetch users');
    }
  }
);

// GET /api/users/:id - Get user by ID (protected)
router.get(
  '/:id',
  authenticateToken,
  validateParams(UserIdSchema),
  async (req, res) => {
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
  }
);

// POST /api/users - Create a new user (protected - admin only)
router.post(
  '/',
  authenticateToken,
  validateBody(CreateUserSchema),
  async (req, res) => {
    try {
      const { email, name } = req.body;
      const user = await userService.createUser({ email, name });
      res.status(201).json(user);
    } catch (error) {
      handleError(res, error, 'Failed to create user');
    }
  }
);

// PUT /api/users/:id - Update user (protected - own profile only)
router.put(
  '/:id',
  authenticateToken,
  validateMultiple({
    params: UserIdSchema,
    body: UpdateUserSchema,
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      // Check if user is updating their own profile
      if (req.user!.id !== id) {
        return res
          .status(403)
          .json({ error: 'You can only update your own profile' });
      }

      const user = await userService.updateUser(id, { email, name });
      res.json(user);
    } catch (error) {
      handleError(res, error, 'Failed to update user');
    }
  }
);

// DELETE /api/users/:id - Delete user (protected - own profile only)
router.delete(
  '/:id',
  authenticateToken,
  validateParams(UserIdSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user is deleting their own profile
      if (req.user!.id !== id) {
        return res
          .status(403)
          .json({ error: 'You can only delete your own profile' });
      }

      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error, 'Failed to delete user');
    }
  }
);

// GET /api/users/email/:email - Get user by email (protected)
router.get(
  '/email/:email',
  authenticateToken,
  validateParams(UserEmailSchema),
  async (req, res) => {
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
  }
);

export { router as usersRouter };
