import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { AuthProvider, useAuth, withAuth } from './AuthContext';
import { authService } from '../services/authService';

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    getStoredTokens: vi.fn(),
    isTokenExpired: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshAccessToken: vi.fn(),
    clearTokens: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

// Test component that uses useAuth hook
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">
        {auth.isLoading ? 'Loading' : 'Not Loading'}
      </div>
      <div data-testid="authenticated">
        {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user">{auth.user ? auth.user.email : 'No User'}</div>
      <button
        onClick={() =>
          auth.login({ email: 'test@example.com', password: 'pass' })
        }
      >
        Login
      </button>
      <button
        onClick={() =>
          auth.register({
            email: 'new@example.com',
            password: 'pass',
            name: 'New',
          })
        }
      >
        Register
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.refreshToken()}>Refresh</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthProvider initialization', () => {
    it('should initialize with no tokens', async () => {
      authService.getStoredTokens.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated'
        );
        expect(screen.getByTestId('user')).toHaveTextContent('No User');
      });
    });

    it('should restore auth state with valid tokens', async () => {
      const mockTokens = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
        expect(screen.getByTestId('user')).toHaveTextContent(
          'test@example.com'
        );
      });
    });

    it('should refresh expired tokens on init', async () => {
      const mockTokens = {
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
      };
      const mockNewTokens = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(true);
      authService.refreshAccessToken.mockResolvedValue(mockNewTokens);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.refreshAccessToken).toHaveBeenCalledWith(
          'refresh-token'
        );
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });
    });

    it('should handle refresh failure on init', async () => {
      const mockTokens = {
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(true);
      authService.refreshAccessToken.mockRejectedValue(
        new Error('Refresh failed')
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.clearTokens).toHaveBeenCalled();
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated'
        );
      });
    });

    it('should handle getCurrentUser failure and try refresh', async () => {
      const mockTokens = {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
      const mockNewTokens = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser
        .mockRejectedValueOnce(new Error('User fetch failed'))
        .mockResolvedValueOnce(mockUser);
      authService.refreshAccessToken.mockResolvedValue(mockNewTokens);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.refreshAccessToken).toHaveBeenCalled();
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockAuthResult = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
      };

      authService.getStoredTokens.mockReturnValue(null);
      authService.login.mockResolvedValue(mockAuthResult);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
        expect(screen.getByTestId('user')).toHaveTextContent(
          'test@example.com'
        );
      });
    });

    it('should handle login failure', async () => {
      authService.getStoredTokens.mockReturnValue(null);
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      // Suppress error logging from the component
      const consoleError = vi.spyOn(console, 'error').mockImplementation();

      act(() => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated'
        );
      });

      consoleError.mockRestore();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockAuthResult = {
        user: { id: '1', email: 'new@example.com', name: 'New User' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
      };

      authService.getStoredTokens.mockReturnValue(null);
      authService.register.mockResolvedValue(mockAuthResult);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      await act(async () => {
        screen.getByText('Register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
        expect(screen.getByTestId('user')).toHaveTextContent('new@example.com');
      });
    });

    it('should handle registration failure', async () => {
      authService.getStoredTokens.mockReturnValue(null);
      authService.register.mockRejectedValue(new Error('Email exists'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      // Suppress error logging from the component
      const consoleError = vi.spyOn(console, 'error').mockImplementation();

      act(() => {
        screen.getByText('Register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated'
        );
      });

      consoleError.mockRestore();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockTokens = {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser.mockResolvedValue(mockUser);
      authService.logout.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(authService.clearTokens).toHaveBeenCalled();
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated'
        );
        expect(screen.getByTestId('user')).toHaveTextContent('No User');
      });
    });

    it('should logout even if server call fails', async () => {
      const mockTokens = {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser.mockResolvedValue(mockUser);
      authService.logout.mockRejectedValue(new Error('Server error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(authService.clearTokens).toHaveBeenCalled();
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated'
        );
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockTokens = {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockNewTokens = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser.mockResolvedValue(mockUser);
      authService.refreshAccessToken.mockResolvedValue(mockNewTokens);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });

      act(() => {
        screen.getByText('Refresh').click();
      });

      await waitFor(() => {
        expect(authService.refreshAccessToken).toHaveBeenCalledWith(
          'refresh-token'
        );
      });
    });

    it('should handle refresh failure and logout', async () => {
      const mockTokens = {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser.mockResolvedValue(mockUser);
      authService.refreshAccessToken.mockRejectedValue(
        new Error('Refresh failed')
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });

      // Suppress error logging from the component
      const consoleError = vi.spyOn(console, 'error').mockImplementation();

      act(() => {
        screen.getByText('Refresh').click();
      });

      await waitFor(() => {
        expect(authService.clearTokens).toHaveBeenCalled();
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated'
        );
      });

      consoleError.mockRestore();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress error boundary console errors
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
    });
  });

  describe('withAuth HOC', () => {
    function ProtectedComponent() {
      return <div>Protected Content</div>;
    }

    const ProtectedWithAuth = withAuth(ProtectedComponent);

    it('should show loading state', async () => {
      authService.getStoredTokens.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser.mockReturnValue(
        new Promise(() => {}) // Never resolves to keep loading
      );

      render(
        <AuthProvider>
          <ProtectedWithAuth />
        </AuthProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show login message when not authenticated', async () => {
      authService.getStoredTokens.mockReturnValue(null);

      render(
        <AuthProvider>
          <ProtectedWithAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText('Please log in to access this page.')
        ).toBeInTheDocument();
      });
    });

    it('should render component when authenticated', async () => {
      const mockTokens = { accessToken: 'token', refreshToken: 'refresh' };
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };

      authService.getStoredTokens.mockReturnValue(mockTokens);
      authService.isTokenExpired.mockReturnValue(false);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <ProtectedWithAuth />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
});
