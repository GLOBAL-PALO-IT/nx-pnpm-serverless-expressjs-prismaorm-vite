import { BaseService } from './api';
import { vi } from 'vitest';

// Mock the authService module
vi.mock('./authService', () => ({
  authService: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    refreshAccessToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

describe('BaseService', () => {
  let service: BaseService;
  let mockFetch: vi.Mock;

  beforeEach(() => {
    service = new BaseService('http://localhost:3000');
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchApi', () => {
    it('should make successful API call without auth', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue(null);

      const result = await service['fetchApi']('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include auth token when available', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue('test-token');

      await service['fetchApi']('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue(null);

      const result = await service['fetchApi']('/test');

      expect(result).toBeNull();
    });

    it('should throw error on failed request', async () => {
      const errorData = { error: 'Something went wrong' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorData,
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue(null);

      await expect(service['fetchApi']('/test')).rejects.toThrow(
        'Something went wrong'
      );
    });

    it('should throw generic error when no error message in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({}),
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue(null);

      await expect(service['fetchApi']('/test')).rejects.toThrow(
        'API Error: Bad Request'
      );
    });

    it('should handle 401 and refresh token successfully', async () => {
      const mockData = { message: 'success' };

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      // Second call (after refresh) succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { authService } = await import('./authService');
      authService.getAccessToken
        .mockReturnValueOnce('expired-token')
        .mockReturnValueOnce('new-token');
      authService.getRefreshToken.mockReturnValue('refresh-token');
      authService.refreshAccessToken.mockResolvedValue(undefined);

      const result = await service['fetchApi']('/test');

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        'refresh-token'
      );
      expect(result).toEqual(mockData);
    });

    it('should handle 401 with retry returning 204', async () => {
      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      // Second call (after refresh) returns 204
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { authService } = await import('./authService');
      authService.getAccessToken
        .mockReturnValueOnce('expired-token')
        .mockReturnValueOnce('new-token');
      authService.getRefreshToken.mockReturnValue('refresh-token');
      authService.refreshAccessToken.mockResolvedValue(undefined);

      const result = await service['fetchApi']('/test');

      expect(result).toBeNull();
    });

    it('should redirect to login when refresh token fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue('expired-token');
      authService.getRefreshToken.mockReturnValue('refresh-token');
      authService.refreshAccessToken.mockRejectedValue(
        new Error('Refresh failed')
      );

      await expect(service['fetchApi']('/test')).rejects.toThrow(
        'Session expired. Please log in again.'
      );

      expect(authService.clearTokens).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('should redirect to login when no refresh token available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue('expired-token');
      authService.getRefreshToken.mockReturnValue(null);

      // When no refresh token, it should throw the original error
      await expect(service['fetchApi']('/test')).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should handle retry request failure after token refresh', async () => {
      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      // Second call (after refresh) also fails with 403
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Access denied' }),
      });

      const { authService } = await import('./authService');
      authService.getAccessToken
        .mockReturnValueOnce('expired-token')
        .mockReturnValueOnce('new-token');
      authService.getRefreshToken.mockReturnValue('refresh-token');
      authService.refreshAccessToken.mockResolvedValue(undefined);

      // The retry also fails, so should throw the retry error which gets caught and becomes "Session expired..."
      await expect(service['fetchApi']('/test')).rejects.toThrow(
        'Session expired. Please log in again.'
      );
    });

    it('should handle error parsing JSON in error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const { authService } = await import('./authService');
      authService.getAccessToken.mockReturnValue(null);

      await expect(service['fetchApi']('/test')).rejects.toThrow(
        'API Error: Internal Server Error'
      );
    });
  });

  describe('constructor', () => {
    it('should use default API base URL', () => {
      const defaultService = new BaseService();
      expect(defaultService['baseUrl']).toBe('http://localhost:3000');
    });

    it('should use custom base URL', () => {
      const customService = new BaseService('https://api.example.com');
      expect(customService['baseUrl']).toBe('https://api.example.com');
    });
  });
});
