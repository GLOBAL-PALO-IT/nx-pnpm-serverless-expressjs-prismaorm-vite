import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExampleUIDemo } from './ExampleUIDemo';

// Mock the UI library components
vi.mock('@nx-serverless/ui', () => ({
  Button: ({ children, variant, ...props }: any) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  CardDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardFooter: ({ children, ...props }: any) => (
    <div data-testid="card-footer" {...props}>
      {children}
    </div>
  ),
  Input: ({ ...props }: any) => <input {...props} />,
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
  Textarea: ({ ...props }: any) => <textarea {...props} />,
}));

describe('ExampleUIDemo', () => {
  it('should render the main heading', () => {
    render(<ExampleUIDemo />);
    expect(screen.getByText('UI Components Demo')).toBeInTheDocument();
  });

  describe('Button section', () => {
    it('should render buttons card', () => {
      render(<ExampleUIDemo />);
      expect(screen.getByText('Buttons')).toBeInTheDocument();
      expect(
        screen.getByText('Various button styles from shadcn/ui')
      ).toBeInTheDocument();
    });

    it('should render all button variants', () => {
      render(<ExampleUIDemo />);

      expect(screen.getByText('Default')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Destructive')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
      expect(screen.getByText('Ghost')).toBeInTheDocument();
      expect(screen.getByText('Link')).toBeInTheDocument();
    });

    it('should render buttons with correct variants', () => {
      render(<ExampleUIDemo />);

      const secondaryBtn = screen.getByText('Secondary');
      expect(secondaryBtn).toHaveAttribute('data-variant', 'secondary');

      const destructiveBtn = screen.getByText('Destructive');
      expect(destructiveBtn).toHaveAttribute('data-variant', 'destructive');

      const outlineBtn = screen.getByText('Outline');
      expect(outlineBtn).toHaveAttribute('data-variant', 'outline');

      const ghostBtn = screen.getByText('Ghost');
      expect(ghostBtn).toHaveAttribute('data-variant', 'ghost');

      const linkBtn = screen.getByText('Link');
      expect(linkBtn).toHaveAttribute('data-variant', 'link');
    });
  });

  describe('Form section', () => {
    it('should render form components card', () => {
      render(<ExampleUIDemo />);
      expect(screen.getByText('Form Components')).toBeInTheDocument();
      expect(screen.getByText('Input fields and labels')).toBeInTheDocument();
    });

    it('should render email input with label', () => {
      render(<ExampleUIDemo />);

      const emailLabel = screen.getByText('Email');
      expect(emailLabel).toBeInTheDocument();
      expect(emailLabel).toHaveAttribute('for', 'email');

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('should render message textarea with label', () => {
      render(<ExampleUIDemo />);

      const messageLabel = screen.getByText('Message');
      expect(messageLabel).toBeInTheDocument();
      expect(messageLabel).toHaveAttribute('for', 'message');

      const messageTextarea = screen.getByPlaceholderText(
        'Type your message here'
      );
      expect(messageTextarea).toBeInTheDocument();
      expect(messageTextarea).toHaveAttribute('id', 'message');
    });

    it('should render submit button in card footer', () => {
      render(<ExampleUIDemo />);

      const submitButtons = screen.getAllByText('Submit');
      expect(submitButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Card structure', () => {
    it('should render multiple cards', () => {
      render(<ExampleUIDemo />);

      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBe(2);
    });

    it('should render card headers', () => {
      render(<ExampleUIDemo />);

      const cardHeaders = screen.getAllByTestId('card-header');
      expect(cardHeaders.length).toBe(2);
    });

    it('should render card contents', () => {
      render(<ExampleUIDemo />);

      const cardContents = screen.getAllByTestId('card-content');
      expect(cardContents.length).toBe(2);
    });

    it('should render card footer', () => {
      render(<ExampleUIDemo />);

      const cardFooters = screen.getAllByTestId('card-footer');
      expect(cardFooters.length).toBe(1);
    });
  });

  describe('layout', () => {
    it('should have proper container structure', () => {
      const { container } = render(<ExampleUIDemo />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('p-8');
      expect(mainDiv).toHaveClass('space-y-8');
    });
  });
});
