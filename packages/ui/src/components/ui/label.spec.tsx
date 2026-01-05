import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('should render label with text', () => {
    render(<Label>Label text</Label>);
    expect(screen.getByText('Label text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Label className="custom-label">Text</Label>);
    const label = screen.getByText('Text');
    expect(label).toHaveClass('custom-label');
  });

  it('should handle htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Username</Label>);
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('should pass through additional props', () => {
    render(
      <Label data-testid="test-label" onClick={() => {}}>
        Clickable
      </Label>
    );
    const label = screen.getByTestId('test-label');
    expect(label).toBeInTheDocument();
  });

  it('should render with child elements', () => {
    render(
      <Label>
        <span>Required</span> Field
      </Label>
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText(/Field/)).toBeInTheDocument();
  });
});
