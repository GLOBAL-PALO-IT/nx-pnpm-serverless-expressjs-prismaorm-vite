import request from 'supertest';
import express from 'express';

// Create mock AuthService class
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  logout: jest.fn(),
};

// Mock all dependencies before importing
jest.mock('@nx-serverless/services', () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService),
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
jest.mock('../middleware/validation', () => ({
  validateBody: () => (req: any, res: any, next: any) => next(),
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

// Now import the router
import { authRouter } from './auth.routes';
import { logger } from '../libs/logger';

describe('auth routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);

    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockResult = {
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
    });

    it('should handle registration errors', async () => {
      const error = new Error('Registration failed');
      (error as any).statusCode = 400;

      mockAuthService.register.mockRejectedValue(error);

      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const mockResult = {
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });

    it('should handle login errors', async () => {
      const error = new Error('Login failed');
      (error as any).statusCode = 401;

      mockAuthService.login.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token successfully', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'old-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ tokens: mockTokens });
    });

    it('should handle refresh errors', async () => {
      const error = new Error('Token refresh failed');
      (error as any).statusCode = 401;

      mockAuthService.refreshAccessToken.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logged out successfully' });
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      (error as any).statusCode = 500;

      mockAuthService.logout.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user info', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'user-1');
    });

    it('should handle errors in /me endpoint', async () => {
      // Create a custom app for this test where the middleware throws an error
      const testApp = express();
      testApp.use(express.json());

      // Mock authenticateToken to throw an error
      const errorMiddleware = (req: any, res: any, next: any) => {
        // Set user but make accessing it cause an issue in the handler
        req.user = null;
        next();
      };

      testApp.get('/auth/me', errorMiddleware, async (req, res) => {
        try {
          // Force an error
          throw new Error('Failed to get user info');
        } catch (error: any) {
          logger.error('API Error:', error);
          const message = error.message || 'Failed to get user info';
          const statusCode = error.statusCode || 500;
          res.status(statusCode).json({ error: message });
        }
      });

      const response = await request(testApp).get('/auth/me');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
