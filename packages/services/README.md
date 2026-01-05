# Services Layer

This library contains business logic services for the nx-serverless monorepo.

## Services

- **AuthService** - Authentication and authorization logic
- **PostService** - Post CRUD operations
- **UserService** - User management operations

## Usage

Import services from this library:

```typescript
import { authService, postService, userService } from '@nx-serverless/services';

// Use services
const user = await authService.login({
  email: 'user@example.com',
  password: 'password',
});
const posts = await postService.getAllPosts();
const users = await userService.getAllUsers();
```
