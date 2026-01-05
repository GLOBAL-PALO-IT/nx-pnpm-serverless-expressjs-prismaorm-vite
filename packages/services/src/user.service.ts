import { prisma, User, Prisma } from '@nx-serverless/data';
import * as bcrypt from 'bcryptjs';

export interface CreateUserInput {
  email: string;
  name?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany({
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
  }

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
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
  }

  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // Hash a default password for admin-created users
      const defaultPassword = await bcrypt.hash('ChangeMe123!', 12);

      return await prisma.user.create({
        data: {
          ...data,
          password: defaultPassword,
        } as any,
        include: {
          posts: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('User with this email already exists');
        }
      }
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('User with this email already exists');
        }
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      // First delete all posts by this user
      await prisma.post.deleteMany({
        where: { authorId: id },
      });

      // Then delete the user
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
      }
      throw error;
    }
  }

  async getUsersWithPostCount(): Promise<
    (User & { _count: { posts: number } })[]
  > {
    return prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const userService = new UserService();
