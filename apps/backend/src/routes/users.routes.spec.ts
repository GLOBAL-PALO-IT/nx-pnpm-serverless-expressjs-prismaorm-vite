import request from 'supertest';
import express from 'express';
import { usersRouter } from './users.routes';
import { userService } from '@nx-serverless/services';
import { logger } from '../libs/logger';

// Mock dependencies
jest.mock('@nx-serverless/services', () => ({
  userService: {
    getAllUsers: jest.fn(),
    getUsersWithPostCount: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUserByEmail: jest.fn(),
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

describe('users routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', usersRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should get all users without post count', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'test1@example.com', name: 'User 1' },
        { id: 'user-2', email: 'test2@example.com', name: 'User 2' },
      ];
      (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(userService.getAllUsers).toHaveBeenCalled();
    });

    it('should get all users with post count', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'test1@example.com',
          name: 'User 1',
          _count: { posts: 5 },
        },
      ];
      (userService.getUsersWithPostCount as jest.Mock).mockResolvedValue(
        mockUsers
      );

      const response = await request(app).get(
        '/api/users?includePostCount=true'
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(userService.getUsersWithPostCount).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      (userService.getAllUsers as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should use default error message and status code', async () => {
      // Create an error without message or statusCode properties
      const errorWithoutProps = Object.create(null);
      (userService.getAllUsers as jest.Mock).mockRejectedValue(
        errorWithoutProps
      );

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch users');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/users/user-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/users/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should handle errors', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/users/user-1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 'user-2',
        email: 'new@example.com',
        name: 'New User',
      };
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'new@example.com', name: 'New User' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUser);
    });

    it('should handle errors', async () => {
      (userService.createUser as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      );

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'new@example.com', name: 'New User' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update own profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'updated@example.com',
        name: 'Updated User',
      };
      (userService.updateUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/users/user-1')
        .send({ email: 'updated@example.com', name: 'Updated User' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it("should return 403 when updating another user's profile", async () => {
      const response = await request(app)
        .put('/api/users/user-2')
        .send({ email: 'updated@example.com', name: 'Updated User' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'You can only update your own profile'
      );
    });

    it('should handle errors', async () => {
      (userService.updateUser as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const response = await request(app)
        .put('/api/users/user-1')
        .send({ email: 'updated@example.com', name: 'Updated User' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete own profile', async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/api/users/user-1');

      expect(response.status).toBe(204);
    });

    it("should return 403 when deleting another user's profile", async () => {
      const response = await request(app).delete('/api/users/user-2');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'You can only delete your own profile'
      );
    });

    it('should handle errors', async () => {
      (userService.deleteUser as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      const response = await request(app).delete('/api/users/user-1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/email/:email', () => {
    it('should get user by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get(
        '/api/users/email/test@example.com'
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(
        '/api/users/email/nonexistent@example.com'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should handle errors', async () => {
      (userService.getUserByEmail as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get(
        '/api/users/email/test@example.com'
      );

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
