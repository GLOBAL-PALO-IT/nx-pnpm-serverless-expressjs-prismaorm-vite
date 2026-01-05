import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class3');
    });

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({ class1: true, class2: false, class3: true });
      expect(result).toBe('class1 class3');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle complex combinations', () => {
      const result = cn(
        'base-class',
        { 'conditional-class': true, hidden: false },
        ['array-class1', 'array-class2'],
        undefined,
        'final-class'
      );
      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
      expect(result).toContain('array-class1');
      expect(result).toContain('array-class2');
      expect(result).toContain('final-class');
      expect(result).not.toContain('hidden');
    });
  });
});
