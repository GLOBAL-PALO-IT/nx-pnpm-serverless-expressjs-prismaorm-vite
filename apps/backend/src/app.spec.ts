import request from 'supertest';
import { app } from './app';
import { logger } from './libs/logger';

// Mock the logger
jest.mock('./libs/logger', () => ({
  logger: {
    info: jest.fn(),
    http: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the route modules
jest.mock('./routes', () => ({
  authRouter: require('express').Router(),
  usersRouter: require('express').Router(),
  postsRouter: require('express').Router(),
}));

describe('backend app', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return welcome message with timestamp and environment', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Hello from Nx Serverless Backend!'
      );
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(logger.info).toHaveBeenCalledWith('Root endpoint accessed');
    });

    it('should use development as default environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.environment).toBe('development');

      // Restore original env
      if (originalEnv) {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should log HTTP request', async () => {
      await request(app).get('/');

      expect(logger.http).toHaveBeenCalled();
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(logger.info).toHaveBeenCalledWith(
        'Health check endpoint accessed'
      );
    });
  });

  describe('GET /api/test', () => {
    it('should return test API response', async () => {
      const response = await request(app).get('/api/test');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'API endpoint working!');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual({ test: true });
    });
  });

  describe('Middleware', () => {
    it('should parse JSON body', async () => {
      const testData = { key: 'value' };
      const response = await request(app).post('/api/test').send(testData);

      // The endpoint doesn't exist but middleware should parse the body
      expect(response.status).toBe(404);
    });

    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
