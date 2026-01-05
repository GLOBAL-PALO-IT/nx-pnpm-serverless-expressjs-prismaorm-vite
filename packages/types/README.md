# Types & Schemas

This library contains Zod validation schemas and TypeScript types for the nx-serverless monorepo.

## Schemas

- **authSchemas** - Authentication and authorization validation
- **postSchemas** - Post CRUD validation
- **userSchemas** - User management validation

## Usage

Import schemas from this library:

```typescript
import {
  LoginSchema,
  CreateUserSchema,
  CreatePostSchema,
} from '@nx-serverless/types';

// Use in validation
const result = LoginSchema.safeParse(data);
```

## Type Exports

All schemas also export their inferred TypeScript types:

```typescript
import type { LoginData, CreateUser, CreatePost } from '@nx-serverless/types';
```
