# Migration Example: Converting UserForm to use @nx-serverless/ui

## Before (using CSS modules)

```tsx
import React, { useState } from 'react';
import { User, CreateUserInput, UpdateUserInput } from '../services/api';
import styles from './UserForm.module.css';

export function UserForm({ user, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email: formData.email.trim(),
      name: formData.name.trim() || undefined,
    });
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>{user ? 'Edit User' : 'Create User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

## After (using shadcn/ui components)

```tsx
import React, { useState } from 'react';
import { User, CreateUserInput, UpdateUserInput } from '../services/api';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Label,
} from '@nx-serverless/ui';

export function UserForm({ user, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
  });

  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; name?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      email: formData.email.trim(),
      name: formData.name.trim() || undefined,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{user ? 'Edit User' : 'Create User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => {
                setFormData({ ...formData, email: e.target.value });
                setErrors({ ...errors, email: undefined });
              }}
              placeholder="user@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <CardFooter className="flex gap-2 px-0">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Key Changes

### 1. **Imports**

- ❌ Removed: `import styles from './UserForm.module.css';`
- ✅ Added: Import from `@nx-serverless/ui`

### 2. **Structure**

- Wrapped form in `Card` component with `CardHeader`, `CardContent`, `CardFooter`
- Better visual hierarchy with shadcn's card structure

### 3. **Styling**

- ❌ Removed: CSS module classes (`styles.form`, `styles.field`, etc.)
- ✅ Added: Tailwind utility classes (`space-y-4`, `text-sm`, etc.)

### 4. **Components**

- `<input>` → `<Input>` (shadcn component)
- `<label>` → `<Label>` (shadcn component)
- `<button>` → `<Button>` (shadcn component with variants)

### 5. **Benefits**

- ✅ Consistent styling across the app
- ✅ Built-in accessibility features
- ✅ Dark mode support (if enabled)
- ✅ Responsive design
- ✅ No need to maintain separate CSS files
- ✅ Easy to customize with Tailwind classes

## Cleanup

After migration, you can delete:

- `apps/frontend/src/components/UserForm.module.css`

Repeat this process for:

- `PostForm.tsx` / `PostForm.module.css`
- `UserList.tsx` / `UserList.module.css`
- `PostList.tsx` / `PostList.module.css`
- Any other form or UI components
