import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('should render textarea element', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('should handle placeholder', () => {
    render(<Textarea placeholder="Enter your message" />);
    expect(
      screen.getByPlaceholderText('Enter your message')
    ).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<Textarea disabled data-testid="disabled-textarea" />);
    const textarea = screen.getByTestId('disabled-textarea');
    expect(textarea).toBeDisabled();
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should pass through additional props', () => {
    render(
      <Textarea
        data-testid="test-textarea"
        name="description"
        required
        rows={5}
        maxLength={500}
      />
    );
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveAttribute('name', 'description');
    expect(textarea).toHaveAttribute('required');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('maxLength', '500');
  });

  it('should handle value prop', () => {
    render(<Textarea value="test content" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('test content');
  });

  it('should handle defaultValue', () => {
    render(<Textarea defaultValue="default content" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('default content');
  });
});
