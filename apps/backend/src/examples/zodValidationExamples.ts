/**
 * Examples of how to use Zod validation in your routes
 *
 * This file demonstrates various validation patterns and use cases.
 * Remove this file after you've reviewed the examples.
 */

import { z } from 'zod';
// Note: These imports are for examples only
// import {
//   validateBody,
//   validateParams,
//   validateQuery,
//   validateMultiple,
// } from '../middleware/validation';

// ===== BASIC VALIDATION EXAMPLES =====

// 1. Simple body validation
const SimpleUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

// Usage: app.post('/users', validateBody(SimpleUserSchema), handler);

// 2. Parameter validation
const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'), // or .cuid() for Prisma CUID
});

// Usage: app.get('/users/:id', validateParams(IdParamSchema), handler);

// 3. Query parameter validation
const UserQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 10)),
  active: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

// Usage: app.get('/users', validateQuery(UserQuerySchema), handler);

// ===== ADVANCED VALIDATION EXAMPLES =====

// 4. Multiple validations at once
const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

// Usage:
// app.put('/users/:id',
//   validateMultiple({
//     params: IdParamSchema,
//     body: UpdateUserSchema
//   }),
//   handler
// );

// ===== COMPLEX VALIDATION PATTERNS =====

// 5. Conditional validation
const PostSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    published: z.boolean().default(false),
    publishedAt: z.string().datetime().optional(),
  })
  .refine(data => !data.published || data.publishedAt, {
    message: 'Published posts must have a publishedAt date',
    path: ['publishedAt'],
  });

// 6. Array validation
const BulkCreateUsersSchema = z.object({
  users: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })
    )
    .min(1, 'At least one user is required')
    .max(100, 'Maximum 100 users allowed'),
});

// 7. Nested object validation
const UserWithAddressSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      zipCode: z.string().regex(/^\d{5}$/, 'Invalid zip code format'),
    })
    .optional(),
});

// ===== CUSTOM VALIDATION HELPERS =====

// 8. Custom validation functions
const isValidAge = (age: number): boolean => age >= 0 && age <= 150;

const UserWithAgeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().refine(isValidAge, {
    message: 'Age must be between 0 and 150',
  }),
});

// 9. Transform and preprocess data
const SearchQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .transform(val => val.trim().toLowerCase()),
  tags: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(tag => tag.trim()) : [])),
});

// ===== ERROR HANDLING EXAMPLES =====

// When validation fails, the middleware automatically returns:
// {
//   "error": "Validation failed",
//   "details": [
//     {
//       "field": "email",
//       "message": "Invalid email format"
//     },
//     {
//       "field": "name",
//       "message": "Name is required"
//     }
//   ]
// }

// ===== TYPESCRIPT INTEGRATION =====

// Extract TypeScript types from Zod schemas
// type SimpleUser = z.infer<typeof SimpleUserSchema>;
// type UpdateUser = z.infer<typeof UpdateUserSchema>;
// type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Use in your route handlers:
// app.post('/users', validateBody(SimpleUserSchema), (req, res) => {
//   const userData: SimpleUser = req.body; // Fully typed!
//   // ... handle request
// });

export {
  SimpleUserSchema,
  IdParamSchema,
  UserQuerySchema,
  UpdateUserSchema,
  PostSchema,
  BulkCreateUsersSchema,
  UserWithAddressSchema,
  UserWithAgeSchema,
  SearchQuerySchema,
};
