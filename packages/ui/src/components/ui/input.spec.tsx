import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('should set input type correctly', () => {
    render(<Input type="email" data-testid="email-input" />);
    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<Input disabled data-testid="disabled-input" />);
    const input = screen.getByTestId('disabled-input');
    expect(input).toBeDisabled();
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should pass through additional props', () => {
    render(
      <Input data-testid="test-input" name="username" required maxLength={50} />
    );
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('name', 'username');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('maxLength', '50');
  });

  it('should handle value prop', () => {
    render(<Input value="test value" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('should handle defaultValue', () => {
    render(<Input defaultValue="default text" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('default text');
  });
});
