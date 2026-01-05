# Cleanup Tasks (Optional)

After verifying that everything works correctly with the new structure, you can optionally remove the old deprecated files.

## ⚠️ Important
**Only perform these cleanup tasks after:**
1. Verifying that `pnpm db:generate` works
2. Verifying that `pnpm nx build backend` succeeds
3. Verifying that `pnpm nx build frontend` succeeds
4. Testing that the application runs correctly with the new imports

## Files/Directories to Remove

### 1. Old Prisma Directory in Backend
```bash
rm -rf apps/backend/prisma/
```
**Contains:** schema.prisma, seed.ts, README.md, MIGRATION.md  
**Moved to:** `apps/data/prisma/`

### 2. Old Services Directory in Backend
```bash
rm -rf apps/backend/src/services/
```
**Contains:** authService.ts, postService.ts, userService.ts, MIGRATION.md  
**Moved to:** `apps/services/src/`

### 3. Old Database Library in Backend
```bash
rm apps/backend/src/libs/database.ts
rm apps/backend/src/libs/MIGRATION-database.md
```
**Moved to:** `apps/data/src/index.ts`

### 4. Optional: Clean Empty Libs Directory
```bash
# Only if the libs directory is now empty or only contains logger.ts
# Keep logger.ts as it's still used by the backend
ls apps/backend/src/libs/
# If only logger.ts remains, keep the directory
```

## Verification After Cleanup

After removing the old files, verify everything still works:

```bash
# 1. Generate Prisma client
pnpm db:generate

# 2. Build backend
pnpm nx build backend

# 3. Build frontend
pnpm nx build frontend

# 4. Run tests (if available)
pnpm nx test backend
pnpm nx test frontend

# 5. Start the applications
pnpm dev:backend  # In one terminal
pnpm dev:frontend # In another terminal
```

## What to Keep

**DO NOT REMOVE:**
- `apps/backend/src/libs/logger.ts` - Still used by backend
- `apps/backend/src/middleware/` - Contains auth and validation middleware
- `apps/backend/src/routes/` - Contains API route handlers
- `apps/backend/src/schemas/` - Contains Zod validation schemas
- Any other files not explicitly listed above

## Rollback Instructions

If something breaks after cleanup, you can restore from git:

```bash
# Restore a specific directory
git restore apps/backend/prisma/
git restore apps/backend/src/services/
git restore apps/backend/src/libs/database.ts

# Or restore all deleted files
git restore .
```

## Migration Path

If you prefer a gradual migration:

1. **Phase 1** (Current): Keep both old and new files, migration notes in place
2. **Phase 2**: After 1-2 weeks of testing, remove old services directory
3. **Phase 3**: After confirming Prisma works correctly, remove old prisma directory
4. **Phase 4**: Remove old database.ts file
5. **Phase 5**: Remove all MIGRATION.md files

## Benefits of Cleanup

- Reduced codebase size
- No confusion about which files to use
- Cleaner git diffs
- Faster IDE indexing
- Single source of truth for each module

## Estimated Time

The cleanup process should take about 5-10 minutes, including verification.
