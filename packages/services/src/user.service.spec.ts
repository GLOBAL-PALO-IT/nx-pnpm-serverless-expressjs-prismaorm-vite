import { UserService } from './user.service';
import { prisma, Prisma } from '@nx-serverless/data';
import * as bcrypt from 'bcryptjs';

// Mock the dependencies
jest.mock('@nx-serverless/data', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      deleteMany: jest.fn(),
    },
  },
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code: string;
      constructor(message: string, code: string) {
        super(message);
        this.code = code;
        this.name = 'PrismaClientKnownRequestError';
      }
    },
  },
}));

jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  describe('getAllUsers', () => {
    it('should return all users with posts', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          posts: [],
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          posts: [],
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              published: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by ID with posts', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        posts: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          posts: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email with posts', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user-123',
        email: email,
        name: 'Test User',
        posts: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail(email);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: email },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              published: true,
              createdAt: true,
            },
          },
        },
      });
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserByEmail(
        'nonexistent@example.com'
      );

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    const createUserData = {
      email: 'newuser@example.com',
      name: 'New User',
    };

    it('should create a new user successfully', async () => {
      const mockCreatedUser = {
        id: 'user-123',
        ...createUserData,
        posts: [],
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(createUserData);

      expect(result).toEqual(mockCreatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('ChangeMe123!', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserData,
          password: 'hashedPassword',
        },
        include: {
          posts: true,
        },
      });
    });

    it('should throw error if email already exists', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Unique constraint failed',
        'P2002'
      );
      (prisma.user.create as jest.Mock).mockRejectedValue(error);

      await expect(userService.createUser(createUserData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should rethrow other Prisma errors', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Other error',
        'P9999'
      );
      (prisma.user.create as jest.Mock).mockRejectedValue(error);

      await expect(userService.createUser(createUserData)).rejects.toThrow(
        error
      );
    });

    it('should rethrow non-Prisma errors', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const error = new Error('Generic error');
      (prisma.user.create as jest.Mock).mockRejectedValue(error);

      await expect(userService.createUser(createUserData)).rejects.toThrow(
        error
      );
    });

    it('should create user without name', async () => {
      const dataWithoutName = {
        email: 'newuser@example.com',
      };
      const mockCreatedUser = {
        id: 'user-123',
        ...dataWithoutName,
        name: null,
        posts: [],
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(dataWithoutName);

      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('updateUser', () => {
    const userId = 'user-123';
    const updateData = {
      name: 'Updated Name',
    };

    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Updated Name',
        posts: [],
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              published: true,
              createdAt: true,
            },
          },
        },
      });
    });

    it('should throw error if email already exists', async () => {
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Unique constraint failed',
        'P2002'
      );
      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      await expect(
        userService.updateUser(userId, { email: 'existing@example.com' })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw error if user not found', async () => {
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Record not found',
        'P2025'
      );
      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        'User not found'
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Generic error');
      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        error
      );
    });

    it('should handle other Prisma errors', async () => {
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Other error',
        'P9999'
      );
      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        error
      );
    });
  });

  describe('deleteUser', () => {
    const userId = 'user-123';

    it('should delete user and their posts successfully', async () => {
      const mockDeletedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      (prisma.post.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockDeletedUser);

      const result = await userService.deleteUser(userId);

      expect(result).toEqual(mockDeletedUser);
      expect(prisma.post.deleteMany).toHaveBeenCalledWith({
        where: { authorId: userId },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.post.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Record not found',
        'P2025'
      );
      (prisma.user.delete as jest.Mock).mockRejectedValue(error);

      await expect(userService.deleteUser(userId)).rejects.toThrow(
        'User not found'
      );
    });

    it('should rethrow other errors', async () => {
      (prisma.post.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      const error = new Error('Generic error');
      (prisma.user.delete as jest.Mock).mockRejectedValue(error);

      await expect(userService.deleteUser(userId)).rejects.toThrow(error);
    });

    it('should handle other Prisma errors', async () => {
      (prisma.post.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Other error',
        'P9999'
      );
      (prisma.user.delete as jest.Mock).mockRejectedValue(error);

      await expect(userService.deleteUser(userId)).rejects.toThrow(error);
    });
  });

  describe('getUsersWithPostCount', () => {
    it('should return users with post count', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          _count: { posts: 5 },
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          _count: { posts: 3 },
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getUsersWithPostCount();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});
