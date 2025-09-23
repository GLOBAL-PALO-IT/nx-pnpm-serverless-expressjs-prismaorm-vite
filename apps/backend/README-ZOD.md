# Zod Validation Setup

This project now includes comprehensive Zod validation for all API routes. Zod provides type-safe validation with excellent TypeScript integration.

## 📁 File Structure

```
src/
├── middleware/
│   └── validation.ts          # Validation middleware functions
├── schemas/
│   ├── index.ts              # Export all schemas
│   ├── userSchemas.ts        # User-related validation schemas
│   └── postSchemas.ts        # Post-related validation schemas
└── examples/
    └── zodValidationExamples.ts # Usage examples (remove after review)
```

## 🚀 Quick Start

### 1. Import validation middleware and schemas

```typescript
import { validateBody, validateParams, validateQuery, validateMultiple } from './middleware/validation';
import { CreateUserSchema, UserIdSchema } from './schemas';
```

### 2. Apply validation to routes

```typescript
// Validate request body
app.post('/api/users', validateBody(CreateUserSchema), async (req, res) => {
  // req.body is now validated and typed
  const { email, name } = req.body;
  // ... handle request
});

// Validate URL parameters
app.get('/api/users/:id', validateParams(UserIdSchema), async (req, res) => {
  // req.params.id is validated as a CUID
  const { id } = req.params;
  // ... handle request
});

// Validate query parameters
app.get('/api/users', validateQuery(UserQuerySchema), async (req, res) => {
  // req.query is validated and transformed
  const { includePostCount } = req.query; // boolean, not string
  // ... handle request
});

// Validate multiple parts of the request
app.put('/api/users/:id', 
  validateMultiple({
    params: UserIdSchema,
    body: UpdateUserSchema
  }),
  async (req, res) => {
    // Both params and body are validated
    const { id } = req.params;
    const { email, name } = req.body;
    // ... handle request
  }
);
```

## 🛡️ Available Schemas

### User Schemas
- `CreateUserSchema` - For creating new users
- `UpdateUserSchema` - For updating existing users
- `UserIdSchema` - For validating user ID parameters
- `UserEmailSchema` - For validating email parameters
- `UserQuerySchema` - For user list query parameters

### Post Schemas
- `CreatePostSchema` - For creating new posts
- `UpdatePostSchema` - For updating existing posts
- `PostIdSchema` - For validating post ID parameters
- `AuthorIdSchema` - For validating author ID parameters
- `PostQuerySchema` - For post list query parameters

## 📝 Validation Features

### ✅ What's Validated

1. **Email formats** - Proper email validation
2. **CUID formats** - Prisma CUID validation for IDs
3. **Required fields** - Ensures required data is present
4. **String lengths** - Min/max length validation
5. **Boolean transformations** - Converts string query params to booleans
6. **Optional fields** - Proper handling of optional data

### 🔄 Automatic Transformations

Query parameters are automatically transformed:
- `"true"/"false"` strings → `boolean` values
- String IDs are validated as CUIDs
- Empty optional fields are handled correctly

### 🚨 Error Response Format

When validation fails, you get structured error responses:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

## 🔧 Validation Middleware Options

### Single Target Validation
```typescript
validateBody(schema)    // Validate request body
validateParams(schema)  // Validate URL parameters
validateQuery(schema)   // Validate query parameters
```

### Multiple Target Validation
```typescript
validateMultiple({
  body: BodySchema,      // Optional
  params: ParamsSchema,  // Optional
  query: QuerySchema,    // Optional
})
```

## 💡 Best Practices

1. **Always validate user input** - Use validation on all routes that accept data
2. **Use specific schemas** - Create focused schemas for different operations
3. **Leverage TypeScript** - Extract types from schemas using `z.infer<typeof Schema>`
4. **Handle edge cases** - Use Zod's refinements for complex validation logic
5. **Keep schemas focused** - One schema per operation/endpoint

## 🔍 Example Usage

Check out `src/examples/zodValidationExamples.ts` for comprehensive examples including:
- Basic validation patterns
- Complex nested validations
- Custom validation functions
- Array and object validation
- TypeScript integration

## 🧪 Testing Validation

You can test validation by sending invalid data to your endpoints:

```bash
# Missing required field
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'

# Invalid email format
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "name": "John"}'

# Invalid ID format
curl http://localhost:3000/api/users/invalid-id
```

All of these will return proper validation error messages.

## 🚀 Next Steps

1. Review the examples in `zodValidationExamples.ts`
2. Test your API endpoints with invalid data
3. Add more specific validation rules as needed
4. Consider adding custom validation functions for business logic
5. Remove the examples file when you're comfortable with the setup

Your API now has robust, type-safe validation! 🎉
