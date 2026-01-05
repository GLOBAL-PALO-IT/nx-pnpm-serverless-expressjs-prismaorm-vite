# Data Layer

This library contains the Prisma setup for the nx-serverless monorepo.

## Structure

- `prisma/` - Prisma schema and seed files
- `src/` - Database client and utilities

## Prisma Commands

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed
```

## Usage

Import the Prisma client from this library:

```typescript
import { prisma } from '@nx-serverless/data';

// Use prisma client
const users = await prisma.user.findMany();
```
