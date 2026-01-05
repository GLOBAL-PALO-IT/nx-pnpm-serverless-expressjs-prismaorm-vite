import { rootService } from './rootService';
import { vi } from 'vitest';

describe('RootService', () => {
  let mockFetch: vi.Mock;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getHealthCheck', () => {
    it('should fetch health check successfully', async () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await rootService.getHealthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/health',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle health check errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Service unavailable' }),
      });

      await expect(rootService.getHealthCheck()).rejects.toThrow();
    });
  });

  describe('getTest', () => {
    it('should fetch test endpoint successfully', async () => {
      const mockResponse = {
        message: 'Test successful',
        data: { test: true },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await rootService.getTest();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle test endpoint errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test failed' }),
      });

      await expect(rootService.getTest()).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(rootService.getHealthCheck()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(rootService.getTest()).rejects.toThrow('Request timeout');
    });
  });
});
