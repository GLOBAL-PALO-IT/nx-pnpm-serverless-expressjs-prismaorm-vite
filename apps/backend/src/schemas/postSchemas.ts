import { z } from 'zod';

// Base post schema
export const PostSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  published: z.boolean().default(false),
  authorId: z.string().cuid('Invalid author ID format'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema for creating a post
export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().optional(),
  published: z.boolean().default(false),
  authorId: z.string().cuid('Invalid author ID format'),
});

// Schema for updating a post
export const UpdatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
});

// Schema for post ID parameter
export const PostIdSchema = z.object({
  id: z.string().cuid('Invalid post ID format'),
});

// Schema for author ID parameter
export const AuthorIdSchema = z.object({
  authorId: z.string().cuid('Invalid author ID format'),
});

// Schema for post query parameters
export const PostQuerySchema = z.object({
  published: z.string().optional().transform((val) => {
    if (val === undefined) return undefined;
    return val === 'true';
  }),
  authorId: z.string().cuid('Invalid author ID format').optional(),
  search: z.string().optional(),
});

// Type exports for TypeScript
export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type PostId = z.infer<typeof PostIdSchema>;
export type AuthorId = z.infer<typeof AuthorIdSchema>;
export type PostQuery = z.infer<typeof PostQuerySchema>;
