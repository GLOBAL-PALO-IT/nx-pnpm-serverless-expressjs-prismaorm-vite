import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Export the prisma instance
export { prisma };

// Re-export Prisma types
export { PrismaClient, Prisma } from '@prisma/client';
export type { User, Post } from '@prisma/client';
