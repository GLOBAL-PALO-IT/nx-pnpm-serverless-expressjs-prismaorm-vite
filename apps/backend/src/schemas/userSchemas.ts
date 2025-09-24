import { z } from 'zod';

// Base user schema
export const UserSchema = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema for creating a user
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name cannot be empty').optional(),
});

// Schema for updating a user
export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name cannot be empty').optional(),
});

// Schema for user ID parameter
export const UserIdSchema = z.object({
  id: z.string().cuid('Invalid user ID format'),
});

// Schema for user email parameter
export const UserEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Schema for user query parameters
export const UserQuerySchema = z.object({
  includePostCount: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

// Type exports for TypeScript
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserId = z.infer<typeof UserIdSchema>;
export type UserEmail = z.infer<typeof UserEmailSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
