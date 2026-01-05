import { AuthService } from './auth.service';
import { prisma } from '@nx-serverless/data';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Mock the dependencies
jest.mock('@nx-serverless/data', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    authService = new AuthService(mockLogger);
  });

  describe('constructor', () => {
    it('should create instance with custom logger', () => {
      const service = new AuthService(mockLogger);
      expect(service).toBeDefined();
    });

    it('should create instance with default logger', () => {
      const service = new AuthService();
      expect(service).toBeDefined();
    });

    it('should use default console logger when no logger provided', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const service = new AuthService();

      // Trigger default logger usage by calling verifyAccessToken with invalid token
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      service.verifyAccessToken('invalid');
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Trigger info logger
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValue('test-token');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValue('test-token');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: registerData.email,
        name: registerData.name,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await authService.register(registerData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(registerData.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: registerData.email,
      });

      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      await expect(authService.register(registerData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        name: 'Test User',
        password: 'hashedPassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(loginData.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: loginData.email,
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(authService.login(loginData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    const refreshToken = 'valid-refresh-token';
    const mockDecoded = {
      userId: 'user-123',
      email: 'test@example.com',
    };

    it('should successfully refresh access token', async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockDecoded.userId,
        email: mockDecoded.email,
        refreshToken: refreshToken,
      });
      (jwt.sign as jest.Mock).mockReturnValue('new-token');
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error if refresh token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toThrow('Invalid refresh token');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw error if refresh token does not match', async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockDecoded.userId,
        email: mockDecoded.email,
        refreshToken: 'different-token',
      });

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toThrow('Invalid refresh token');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const refreshToken = 'valid-refresh-token';
    const mockDecoded = {
      userId: 'user-123',
      email: 'test@example.com',
    };

    it('should successfully logout a user', async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await authService.logout(refreshToken);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockDecoded.userId },
        data: { refreshToken: null },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error if refresh token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.logout(refreshToken)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(authService.logout(refreshToken)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = 'valid-token';
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.verifyAccessToken(token);

      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid access token', () => {
      const token = 'invalid-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = authService.verifyAccessToken(token);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = 'valid-token';
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.verifyRefreshToken(token);

      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid refresh token', () => {
      const token = 'invalid-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = authService.verifyRefreshToken(token);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should handle errors when getting user by ID', async () => {
      const userId = 'user-123';
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(authService.getUserById(userId)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const userId = 'user-123';
    const currentPassword = 'oldPassword123';
    const newPassword = 'newPassword123';

    it('should change password successfully', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedOldPassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await authService.changePassword(userId, currentPassword, newPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        mockUser.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: 'hashedNewPassword',
          refreshToken: null,
        },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('User not found');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw error if current password is incorrect', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedOldPassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle password change errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
