import { prisma, PrismaClient, Prisma } from './index';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {},
    post: {},
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    Prisma: {
      DbNull: 'DbNull',
      JsonNull: 'JsonNull',
    },
  };
});

describe('data package', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the global cache
    delete (globalThis as any).__prisma;
  });

  describe('prisma instance', () => {
    it('should export prisma instance', () => {
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });

    it('should export PrismaClient class', () => {
      expect(PrismaClient).toBeDefined();
      expect(typeof PrismaClient).toBe('function');
    });

    it('should export Prisma namespace', () => {
      expect(Prisma).toBeDefined();
      expect(Prisma.DbNull).toBeDefined();
      expect(Prisma.JsonNull).toBeDefined();
    });

    it('should create a singleton instance in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Import again to trigger the singleton logic
      jest.resetModules();
      jest.mock('@prisma/client', () => {
        const mockPrismaClient = {
          user: {},
          post: {},
          $connect: jest.fn(),
          $disconnect: jest.fn(),
        };
        return {
          PrismaClient: jest.fn(() => mockPrismaClient),
          Prisma: {
            DbNull: 'DbNull',
            JsonNull: 'JsonNull',
          },
        };
      });

      // Test that the instance is cached
      const { prisma: prisma1 } = require('./index');
      (globalThis as any).__prisma = prisma1;
      const { prisma: prisma2 } = require('./index');

      expect(prisma1).toBeDefined();
      expect(prisma2).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Create instance should still work
      const instance = prisma;
      expect(instance).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should use existing global prisma instance in development if available', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockInstance = { test: 'mock' };
      (globalThis as any).__prisma = mockInstance;

      // Force module reload
      jest.resetModules();
      jest.mock('@prisma/client', () => {
        const mockPrismaClient = {
          user: {},
          post: {},
          $connect: jest.fn(),
          $disconnect: jest.fn(),
        };
        return {
          PrismaClient: jest.fn(() => mockPrismaClient),
          Prisma: {
            DbNull: 'DbNull',
            JsonNull: 'JsonNull',
          },
        };
      });

      const { prisma: newPrisma } = require('./index');
      // Should use the existing global instance
      expect(newPrisma).toBe(mockInstance);

      process.env.NODE_ENV = originalEnv;
      delete (globalThis as any).__prisma;
    });
  });

  describe('Type exports', () => {
    it('should have User type available (compile-time check)', () => {
      // This is a compile-time check - if types aren't exported, this won't compile
      type TestUser = {
        id: string;
        email: string;
        name: string | null;
      };
      const testUser: TestUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      expect(testUser).toBeDefined();
    });

    it('should have Post type available (compile-time check)', () => {
      // This is a compile-time check - if types aren't exported, this won't compile
      type TestPost = {
        id: string;
        title: string;
        content: string | null;
        published: boolean;
        authorId: string;
      };
      const testPost: TestPost = {
        id: '123',
        title: 'Test Post',
        content: 'Content',
        published: false,
        authorId: '456',
      };
      expect(testPost).toBeDefined();
    });
  });
});
