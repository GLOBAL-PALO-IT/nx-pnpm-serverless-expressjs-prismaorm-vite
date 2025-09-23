import { authService } from './authService';

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

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const accessToken = authService.getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(newAccessToken && { Authorization: `Bearer ${newAccessToken}` }),
              ...options?.headers,
            },
            ...options,
          });

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${retryResponse.statusText}`);
          }

          // Handle 204 No Content responses
          if (retryResponse.status === 204) {
            return null as T;
          }

          return retryResponse.json();
        }
      } catch (refreshError) {
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

  // Health and test endpoints
  async getHealthCheck() {
    return this.fetchApi('/health');
  }

  async getTest() {
    return this.fetchApi('/api/test');
  }

  // User endpoints
  async getUsers(includePostCount = false): Promise<User[]> {
    const params = includePostCount ? '?includePostCount=true' : '';
    return this.fetchApi<User[]>(`/api/users${params}`);
  }

  async getUserById(id: string): Promise<User> {
    return this.fetchApi<User>(`/api/users/${id}`);
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.fetchApi<User>(`/api/users/email/${encodeURIComponent(email)}`);
  }

  async createUser(data: CreateUserInput): Promise<User> {
    return this.fetchApi<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return this.fetchApi<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.fetchApi<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Post endpoints
  async getPosts(filters?: PostFilters): Promise<Post[]> {
    const params = new URLSearchParams();
    if (filters?.published !== undefined) {
      params.append('published', filters.published.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/posts?${queryString}` : '/api/posts';
    return this.fetchApi<Post[]>(endpoint);
  }

  async getPostById(id: string): Promise<Post> {
    return this.fetchApi<Post>(`/api/posts/${id}`);
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return this.fetchApi<Post[]>(`/api/posts/author/${authorId}`);
  }

  async getPublishedPosts(): Promise<Post[]> {
    return this.fetchApi<Post[]>('/api/posts/published');
  }

  async createPost(data: CreatePostInput): Promise<Post> {
    return this.fetchApi<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: string, data: UpdatePostInput): Promise<Post> {
    return this.fetchApi<Post>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string): Promise<void> {
    return this.fetchApi<void>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePostPublishStatus(id: string): Promise<Post> {
    return this.fetchApi<Post>(`/api/posts/${id}/toggle-publish`, {
      method: 'PATCH',
    });
  }

  async searchPosts(searchTerm: string): Promise<Post[]> {
    return this.getPosts({ search: searchTerm });
  }
}

export const apiService = new ApiService();
