import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { logger } from '../libs/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

/**
 * Authentication middleware that verifies JWT access token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token is required' });
      return;
    }

    // Verify the access token
    const decoded = authService.verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired access token' });
      return;
    }

    // Get user details from database
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user to request object
    req.user = user;

    logger.debug(`Authenticated user: ${user.email}`);
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional authentication middleware that doesn't fail if no token is provided
 */
export const optionalAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Verify the access token
    const decoded = authService.verifyAccessToken(token);

    if (decoded) {
      // Get user details from database
      const user = await authService.getUserById(decoded.userId);

      if (user) {
        // Attach user to request object
        req.user = user;
        logger.debug(`Optionally authenticated user: ${user.email}`);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    // Continue without authentication even if there's an error
    next();
  }
};

/**
 * Middleware to check if user is authenticated (for routes that require authentication)
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

/**
 * Middleware to extract user ID from authenticated request
 */
export const getCurrentUserId = (req: Request): string => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user.id;
};

/**
 * Middleware to check if the authenticated user owns the resource
 */
export const requireOwnership = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resourceUserId = req.params[userIdParam];

    if (req.user.id !== resourceUserId) {
      res.status(403).json({ error: 'Access denied: You can only access your own resources' });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if the authenticated user owns a post
 */
export const requirePostOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const postId = req.params.id;

    if (!postId) {
      res.status(400).json({ error: 'Post ID is required' });
      return;
    }

    // This would require importing postService or prisma client
    // For now, we'll add this check in the route handler
    // You can expand this if needed

    next();
  } catch (error) {
    logger.error('Post ownership check error:', error);
    res.status(500).json({ error: 'Failed to verify post ownership' });
  }
};
