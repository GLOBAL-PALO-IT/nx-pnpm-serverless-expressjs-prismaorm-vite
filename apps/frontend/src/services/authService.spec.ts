import { authService } from './authService';
import { vi } from 'vitest';

describe('AuthService', () => {
  let mockFetch: vi.Mock;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock localStorage
    mockLocalStorage = {};
    const localStorageMock = {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        mockLocalStorage = {};
      }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Clear tokens before each test
    authService.clearTokens();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        tokens: { accessToken: 'access123', refreshToken: 'refresh123' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'access123'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh123'
      );
      expect(authService.getAccessToken()).toBe('access123');
    });

    it('should throw error on failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully and store tokens', async () => {
      const mockResponse = {
        user: { id: '1', email: 'new@example.com', name: 'New User' },
        tokens: { accessToken: 'access456', refreshToken: 'refresh456' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'access456'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh456'
      );
    });

    it('should throw error on failed registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email already exists' }),
      });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'User',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear tokens', async () => {
      // First set some tokens
      mockLocalStorage['accessToken'] = 'access123';
      mockLocalStorage['refreshToken'] = 'refresh123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(authService.getAccessToken()).toBeNull();
    });

    it('should clear tokens even if API call fails', async () => {
      mockLocalStorage['accessToken'] = 'access123';
      mockLocalStorage['refreshToken'] = 'refresh123';

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.logout()).rejects.toThrow();

      // Tokens should still be cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        tokens: {
          accessToken: 'newAccess123',
          refreshToken: 'newRefresh123',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await authService.refreshAccessToken('oldRefresh123');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'newAccess123'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'newRefresh123'
      );
      expect(authService.getAccessToken()).toBe('newAccess123');
    });

    it('should throw error when refresh fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid refresh token' }),
      });

      await expect(
        authService.refreshAccessToken('invalidToken')
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Current User',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should throw error when fetching user fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('getAccessToken', () => {
    it('should return access token from memory', () => {
      mockLocalStorage['accessToken'] = 'testToken';
      authService['loadTokensFromStorage']();

      expect(authService.getAccessToken()).toBe('testToken');
    });

    it('should return null when no token exists', () => {
      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from memory', () => {
      mockLocalStorage['refreshToken'] = 'refreshToken';
      authService['loadTokensFromStorage']();

      expect(authService.getRefreshToken()).toBe('refreshToken');
    });

    it('should return null when no token exists', () => {
      expect(authService.getRefreshToken()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear tokens from memory and localStorage', () => {
      mockLocalStorage['accessToken'] = 'access123';
      mockLocalStorage['refreshToken'] = 'refresh123';

      authService.clearTokens();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(authService.getAccessToken()).toBeNull();
      expect(authService.getRefreshToken()).toBeNull();
    });
  });

  describe('getStoredTokens', () => {
    it('should return tokens from localStorage', () => {
      mockLocalStorage['accessToken'] = 'access123';
      mockLocalStorage['refreshToken'] = 'refresh123';

      const tokens = authService.getStoredTokens();

      expect(tokens).toEqual({
        accessToken: 'access123',
        refreshToken: 'refresh123',
      });
    });

    it('should return null when no tokens exist', () => {
      const tokens = authService.getStoredTokens();

      expect(tokens).toBeNull();
    });

    it('should return null when only one token exists', () => {
      mockLocalStorage['accessToken'] = 'access123';

      const tokens = authService.getStoredTokens();

      expect(tokens).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no token exists', () => {
      expect(authService.isTokenExpired()).toBe(true);
    });

    it('should return true when token is expired', () => {
      // Create an expired token (exp is in the past)
      const expiredToken = createMockJWT({
        exp: Math.floor(Date.now() / 1000) - 3600,
      });
      mockLocalStorage['accessToken'] = expiredToken;
      authService['loadTokensFromStorage']();

      expect(authService.isTokenExpired()).toBe(true);
    });

    it('should return false when token is valid', () => {
      // Create a valid token (exp is in the future)
      const validToken = createMockJWT({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      mockLocalStorage['accessToken'] = validToken;
      authService['loadTokensFromStorage']();

      expect(authService.isTokenExpired()).toBe(false);
    });

    it('should return true when token has invalid format', () => {
      mockLocalStorage['accessToken'] = 'invalid-token';
      authService['loadTokensFromStorage']();

      expect(authService.isTokenExpired()).toBe(true);
    });

    it('should return true when token payload is invalid JSON', () => {
      const invalidToken = 'header.invalid-json.signature';
      mockLocalStorage['accessToken'] = invalidToken;
      authService['loadTokensFromStorage']();

      expect(authService.isTokenExpired()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        authService.login({ email: 'test@example.com', password: 'pass' })
      ).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON in error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(
        authService.login({ email: 'test@example.com', password: 'pass' })
      ).rejects.toThrow();
    });
  });
});

// Helper function to create a mock JWT
function createMockJWT(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}
