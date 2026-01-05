import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Route } from './_authenticated';
import { useAuth } from '../contexts/AuthContext';

// Mock dependencies
vi.mock('../contexts/AuthContext');
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Authenticated Content</div>,
  };
});

describe('_authenticated route', () => {
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export Route configuration', () => {
    expect(Route).toBeDefined();
    expect(Route.options).toBeDefined();
  });

  it('should have component defined', () => {
    expect(Route.options.component).toBeDefined();
  });

  it('should have beforeLoad guard', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  describe('AuthenticatedLayout component', () => {
    const AuthenticatedLayout = Route.options.component as React.FC;

    it('should show loading state', () => {
      mockUseAuth.mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        tokens: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
      });

      render(<AuthenticatedLayout />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render outlet when loaded', () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
      });

      render(<AuthenticatedLayout />);

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
    });
  });
});
