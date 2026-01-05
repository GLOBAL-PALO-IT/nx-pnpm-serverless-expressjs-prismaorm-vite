# @nx-serverless/ui

Shared UI components library built with shadcn/ui and Tailwind CSS.

## Usage

```tsx
import { Button, Card, Input } from '@nx-serverless/ui';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

## Components

- Button
- Card
- Input
- Label
- And more...

## Adding New Components

Use shadcn CLI to add new components:

```bash
npx shadcn@latest add [component-name]
```
