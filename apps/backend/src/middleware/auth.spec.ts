import { Request, Response, NextFunction } from 'express';
import { logger } from '../libs/logger';

// Create mock auth service
const mockAuthService = {
  verifyAccessToken: jest.fn(),
  getUserById: jest.fn(),
};

// Mock dependencies BEFORE importing the middleware
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

// Now import the middleware after mocks are set up
import {
  authenticateToken,
  optionalAuthentication,
  requireAuth,
  getCurrentUserId,
  requireOwnership,
  requirePostOwnership,
} from './auth';

describe('auth middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined,
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();

    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and attach user to request', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-1' });
      mockAuthService.getUserById.mockResolvedValue(mockUser);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith(
        'valid-token'
      );
      expect(mockAuthService.getUserById).toHaveBeenCalledWith('user-1');
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', async () => {
      mockRequest.headers = {};

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token is required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header has no token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token is required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue(null);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired access token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-1' });
      mockAuthService.getUserById.mockResolvedValue(null);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockAuthService.getUserById).toHaveBeenCalledWith('user-1');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle errors and return 401', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-1' });
      mockAuthService.getUserById.mockRejectedValue(
        new Error('Database error')
      );

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication failed',
      });
      expect(logger.error).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuthentication', () => {
    it('should authenticate valid token and attach user to request', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-1' });
      mockAuthService.getUserById.mockResolvedValue(mockUser);

      await optionalAuthentication(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should continue without authentication if no token provided', async () => {
      mockRequest.headers = {};

      await optionalAuthentication(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockAuthService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should continue without authentication if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue(null);

      await optionalAuthentication(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should continue without authentication if user not found', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-1' });
      mockAuthService.getUserById.mockResolvedValue(null);

      await optionalAuthentication(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should continue without authentication on error', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-1' });
      mockAuthService.getUserById.mockRejectedValue(
        new Error('Database error')
      );

      await optionalAuthentication(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should call next if user is authenticated', () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      mockRequest.user = undefined;

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user ID if authenticated', () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userId = getCurrentUserId(mockRequest as Request);

      expect(userId).toBe('user-1');
    });

    it('should throw error if user not authenticated', () => {
      mockRequest.user = undefined;

      expect(() => getCurrentUserId(mockRequest as Request)).toThrow(
        'User not authenticated'
      );
    });
  });

  describe('requireOwnership', () => {
    it('should call next if user owns the resource', () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRequest.params = { id: 'user-1' };

      const middleware = requireOwnership('id');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user not authenticated', () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: 'user-1' };

      const middleware = requireOwnership('id');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not own the resource', () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRequest.params = { id: 'user-2' };

      const middleware = requireOwnership('id');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied: You can only access your own resources',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should work with custom param name', () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRequest.params = { userId: 'user-1' };

      const middleware = requireOwnership('userId');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('requirePostOwnership', () => {
    it('should call next if user is authenticated and post ID is provided', async () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRequest.params = { id: 'post-1' };

      await requirePostOwnership(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: 'post-1' };

      await requirePostOwnership(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 400 if post ID not provided', async () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRequest.params = {};

      await requirePostOwnership(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Post ID is required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500', async () => {
      mockRequest.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create a params object that throws an error when accessed
      Object.defineProperty(mockRequest, 'params', {
        get: () => {
          throw new Error('Unexpected error');
        },
      });

      await requirePostOwnership(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to verify post ownership',
      });
      expect(logger.error).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
