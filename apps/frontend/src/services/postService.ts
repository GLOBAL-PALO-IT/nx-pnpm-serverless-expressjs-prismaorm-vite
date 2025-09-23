import {
  BaseService,
  Post,
  CreatePostInput,
  UpdatePostInput,
  PostFilters,
} from './api';

class PostService extends BaseService {
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

export const postService = new PostService();
