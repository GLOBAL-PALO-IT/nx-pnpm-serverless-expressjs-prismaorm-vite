import { Router } from 'express';
import { AuthService } from '@nx-serverless/services';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../libs/logger';
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  LogoutSchema,
} from '@nx-serverless/types';

const router = Router();

// Lazy load AuthService instance to allow proper mocking in tests
let authService: AuthService;
const getAuthService = () => {
  if (!authService) {
    authService = new AuthService(logger);
  }
  return authService;
};

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

// POST /auth/register - Register a new user
router.post('/register', validateBody(RegisterSchema), async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const result = await getAuthService().register({ email, name, password });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 'Registration failed');
  }
});

// POST /auth/login - Login user
router.post('/login', validateBody(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await getAuthService().login({ email, password });
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Login failed');
  }
});

// POST /auth/refresh - Refresh access token
router.post('/refresh', validateBody(RefreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await getAuthService().refreshAccessToken(refreshToken);
    res.json({ tokens });
  } catch (error) {
    handleError(res, error, 'Token refresh failed');
  }
});

// POST /auth/logout - Logout user
router.post('/logout', validateBody(LogoutSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await getAuthService().logout(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    handleError(res, error, 'Logout failed');
  }
});

// GET /auth/me - Get current user info (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    res.json({ user: req.user });
  } catch (error) {
    handleError(res, error, 'Failed to get user info');
  }
});

export { router as authRouter };
