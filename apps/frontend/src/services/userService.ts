import { BaseService, User, CreateUserInput, UpdateUserInput } from './api';

class UserService extends BaseService {
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
}

export const userService = new UserService();
