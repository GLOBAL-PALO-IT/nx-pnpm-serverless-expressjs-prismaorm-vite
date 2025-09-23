# Prisma Database Seeding

This directory contains the Prisma schema and seeding scripts for the backend application.

## Files

- `schema.prisma` - Database schema definition
- `seed.ts` - Database seeding script with sample data

## Running the Seed Script

To populate your database with sample data, run:

```bash
# From the project root
pnpm run db:seed

# Or using nx directly
nx run backend:prisma:seed
```

## Seed Data

The seed script creates:

- **4 Users**: Alice Johnson, Bob Smith, Charlie Brown, and Diana Prince
- **10 Posts**: A mix of published and draft posts across all users
  - 8 published posts
  - 2 draft posts

## Database Operations

Before seeding, the script will:
1. Clear all existing posts
2. Clear all existing users
3. Create fresh sample data

This ensures a clean, consistent state every time you run the seed script.

## Customizing Seed Data

You can modify `seed.ts` to add your own sample data or adjust the existing data to better match your development needs.
