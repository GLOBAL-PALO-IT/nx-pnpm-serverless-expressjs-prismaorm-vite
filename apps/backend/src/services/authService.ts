import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../libs/logger';
import type { LoginData, RegisterData } from '../schemas/authSchemas';

const prisma = new PrismaClient();

// JWT secrets from environment variables
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  tokens: TokenPair;
}

interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Generate JWT refresh token
   */
  private generateRefreshToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Generate both access and refresh tokens
   */
  private generateTokenPair(userId: string, email: string): TokenPair {
    const payload = { userId, email };
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  public verifyAccessToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Access token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  public verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Register a new user
   */
  public async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await this.hashPassword(data.password);

      // Generate tokens
      const tokens = this.generateTokenPair('temp', data.email);

      // Create user with hashed password and refresh token
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          refreshToken: tokens.refreshToken,
        } as any,
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      // Generate new tokens with the actual user ID
      const finalTokens = this.generateTokenPair(user.id, user.email);

      // Update user with the correct refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: finalTokens.refreshToken } as any,
      });

      logger.info(`User registered successfully: ${user.email}`);

      return {
        user,
        tokens: finalTokens,
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  public async login(data: LoginData): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      }) as any;

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(data.password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate new tokens
      const tokens = this.generateTokenPair(user.id, user.email);

      // Update user's refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken } as any,
      });

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      if (!decoded) {
        throw new Error('Invalid refresh token');
      }

      // Find user and verify refresh token matches
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      }) as any;

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokenPair(user.id, user.email);

      // Update user's refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken } as any,
      });

      logger.info(`Access token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  public async logout(refreshToken: string): Promise<void> {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      if (!decoded) {
        throw new Error('Invalid refresh token');
      }

      // Clear refresh token from database
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { refreshToken: null } as any,
      });

      logger.info(`User logged out successfully: ${decoded.email}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get user by ID (for middleware)
   */
  public async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      }) as any;

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password and clear refresh token (force re-login)
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
          refreshToken: null,
        } as any,
      });

      logger.info(`Password changed for user: ${user.email}`);
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
