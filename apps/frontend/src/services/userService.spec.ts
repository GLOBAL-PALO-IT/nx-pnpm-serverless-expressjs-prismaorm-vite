import { userService } from './userService';
import { vi } from 'vitest';
import type { User, CreateUserInput, UpdateUserInput } from './api';

describe('UserService', () => {
  let mockFetch: vi.Mock;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch users without post count', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const result = await userService.getUsers();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users',
        expect.any(Object)
      );
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users with post count', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          _count: { posts: 5 },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const result = await userService.getUsers(true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users?includePostCount=true',
        expect.any(Object)
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id', async () => {
      const mockUser: User = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await userService.getUserById('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserByEmail', () => {
    it('should fetch user by email', async () => {
      const mockUser: User = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await userService.getUserByEmail('user@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/email/user%40example.com',
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });

    it('should encode special characters in email', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test+user@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      await userService.getUserByEmail('test+user@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/email/test%2Buser%40example.com',
        expect.any(Object)
      );
    });
  });

  describe('createUser', () => {
    it('should create user with name', async () => {
      const input: CreateUserInput = {
        email: 'newuser@example.com',
        name: 'New User',
      };

      const mockUser: User = {
        id: '2',
        email: input.email,
        name: input.name,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await userService.createUser(input);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should create user without name', async () => {
      const input: CreateUserInput = {
        email: 'newuser@example.com',
      };

      const mockUser: User = {
        id: '2',
        email: input.email,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await userService.createUser(input);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update user email', async () => {
      const input: UpdateUserInput = {
        email: 'updated@example.com',
      };

      const mockUser: User = {
        id: '1',
        email: input.email!,
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await userService.updateUser('1', input);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(input),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should update user name', async () => {
      const input: UpdateUserInput = {
        name: 'Updated Name',
      };

      const mockUser: User = {
        id: '1',
        email: 'user@example.com',
        name: input.name,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await userService.updateUser('1', input);

      expect(result).toEqual(mockUser);
    });

    it('should update both email and name', async () => {
      const input: UpdateUserInput = {
        email: 'updated@example.com',
        name: 'Updated Name',
      };

      const mockUser: User = {
        id: '1',
        email: input.email!,
        name: input.name,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await userService.updateUser('1', input);

      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await userService.deleteUser('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(userService.getUsers()).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'User not found' }),
      });

      await expect(userService.getUserById('999')).rejects.toThrow();
    });
  });
});
