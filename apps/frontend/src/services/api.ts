const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  posts?: Post[];
  _count?: { posts: number };
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  published: boolean;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export interface CreatePostInput {
  title: string;
  content?: string;
  published?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  published?: boolean;
}

export interface PostFilters {
  published?: boolean;
  search?: string;
}

export abstract class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Import authService dynamically to avoid circular dependency
    const { authService } = await import('./authService');
    const accessToken = authService.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options?.headers,
      },
      ...options,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && accessToken) {
      try {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          await authService.refreshAccessToken(refreshToken);
          const newAccessToken = authService.getAccessToken();

          // Retry the request with new token
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(newAccessToken && {
                Authorization: `Bearer ${newAccessToken}`,
              }),
              ...options?.headers,
            },
            ...options,
          });

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new Error(
              errorData.error || `API Error: ${retryResponse.statusText}`
            );
          }

          // Handle 204 No Content responses
          if (retryResponse.status === 204) {
            return null as T;
          }

          return retryResponse.json();
        }
      } catch {
        // If refresh fails, clear tokens and redirect to login
        authService.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }
}
