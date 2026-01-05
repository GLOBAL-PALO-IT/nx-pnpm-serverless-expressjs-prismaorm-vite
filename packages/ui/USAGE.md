# Using the UI Package in Your Frontend

## Overview

The `@nx-serverless/ui` package has been set up with **shadcn/ui** components and **Tailwind CSS**. All your common UI components (Button, Card, Input, Label, Textarea, etc.) are now available for use across your applications.

## What's Been Set Up

### 1. **packages/ui** - Your UI Component Library

- ✅ shadcn/ui components installed (Button, Card, Input, Label, Textarea)
- ✅ Tailwind CSS configured with custom theme
- ✅ Utility functions (cn for class merging)
- ✅ TypeScript support
- ✅ Nx build configuration

### 2. **Frontend Integration**

- ✅ Tailwind CSS configured in frontend
- ✅ PostCSS configured
- ✅ Global styles imported
- ✅ Workspace paths updated

## Using Components in Your Frontend

### Import Components

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
} from '@nx-serverless/ui';
```

### Example: Replace Your UserForm

Instead of custom styled components, you can now use shadcn components:

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
} from '@nx-serverless/ui';
import { User, CreateUserInput } from '../services/api';

export function UserForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Available Components

### Button

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Inputs

```tsx
<div className="space-y-2">
  <Label htmlFor="input">Label</Label>
  <Input id="input" type="text" placeholder="Placeholder" />
</div>

<Textarea placeholder="Multi-line text" />
```

## Adding More Components

To add more shadcn components:

```bash
cd packages/ui
npx shadcn@latest add [component-name]
```

Popular components to add:

- `dialog` - Modal dialogs
- `dropdown-menu` - Dropdown menus
- `form` - Form handling with validation
- `select` - Select dropdowns
- `checkbox` - Checkboxes
- `switch` - Toggle switches
- `toast` - Toast notifications
- `badge` - Badges and tags
- `alert` - Alert messages
- `tabs` - Tabbed interfaces

After adding, export them in `packages/ui/src/index.ts`:

```typescript
export { Dialog, DialogContent, DialogHeader } from './components/ui/dialog';
```

## Tailwind Classes

You can use all Tailwind utility classes in your components:

```tsx
<div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button>Action</Button>
</div>
```

## Testing the Setup

A demo component has been created at:
`apps/frontend/src/components/ExampleUIDemo.tsx`

You can import and use it in your app to see all the components in action:

```tsx
import { ExampleUIDemo } from './components/ExampleUIDemo';

// In your route or app component
<ExampleUIDemo />;
```

## Next Steps

1. **Replace existing form components** - Update PostForm and UserForm to use the new UI components
2. **Remove old CSS modules** - You can delete the `.module.css` files once migrated
3. **Add more components** - Use shadcn CLI to add components as needed
4. **Customize theme** - Edit `packages/ui/tailwind.config.js` to match your brand
5. **Add dark mode** - shadcn comes with dark mode support out of the box

## Build Commands

```bash
# Build the UI package
pnpm nx build ui

# Build frontend (includes UI package)
pnpm nx build frontend

# Dev mode
pnpm dev:frontend
```

## Troubleshooting

### TypeScript errors

Make sure the path alias is set in `tsconfig.base.json`:

```json
"@nx-serverless/ui": ["packages/ui/src/index.ts"]
```

### Styles not loading

Ensure you've imported the global styles in `apps/frontend/src/styles.css`:

```css
@import '../../packages/ui/src/styles/globals.css';
```

### Build errors

Clean and rebuild:

```bash
pnpm clean
pnpm install
pnpm nx build ui
```
