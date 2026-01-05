import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  describe('Component', () => {
    it('should render button with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should apply variant classes', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-destructive');
    });

    it('should apply size classes', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-9');
    });

    it('should handle disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should pass through additional props', () => {
      render(
        <Button type="submit" data-testid="submit-btn">
          Submit
        </Button>
      );
      const button = screen.getByTestId('submit-btn');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render as child when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/link');
    });
  });

  describe('buttonVariants', () => {
    it('should generate default variant classes', () => {
      const result = buttonVariants();
      expect(result).toContain('bg-primary');
      expect(result).toContain('text-primary-foreground');
    });

    it('should generate destructive variant classes', () => {
      const result = buttonVariants({ variant: 'destructive' });
      expect(result).toContain('bg-destructive');
      expect(result).toContain('text-destructive-foreground');
    });

    it('should generate outline variant classes', () => {
      const result = buttonVariants({ variant: 'outline' });
      expect(result).toContain('border');
      expect(result).toContain('border-input');
    });

    it('should generate secondary variant classes', () => {
      const result = buttonVariants({ variant: 'secondary' });
      expect(result).toContain('bg-secondary');
      expect(result).toContain('text-secondary-foreground');
    });

    it('should generate ghost variant classes', () => {
      const result = buttonVariants({ variant: 'ghost' });
      expect(result).toContain('hover:bg-accent');
    });

    it('should generate link variant classes', () => {
      const result = buttonVariants({ variant: 'link' });
      expect(result).toContain('text-primary');
      expect(result).toContain('underline-offset-4');
    });

    it('should generate small size classes', () => {
      const result = buttonVariants({ size: 'sm' });
      expect(result).toContain('h-9');
    });

    it('should generate large size classes', () => {
      const result = buttonVariants({ size: 'lg' });
      expect(result).toContain('h-11');
    });

    it('should generate icon size classes', () => {
      const result = buttonVariants({ size: 'icon' });
      expect(result).toContain('h-10');
      expect(result).toContain('w-10');
    });

    it('should combine variant and size classes', () => {
      const result = buttonVariants({ variant: 'destructive', size: 'lg' });
      expect(result).toContain('bg-destructive');
      expect(result).toContain('h-11');
    });

    it('should accept custom className', () => {
      const result = buttonVariants({ className: 'custom-class' });
      expect(result).toContain('custom-class');
    });
  });
});
