import * as uiExports from './index';
import { cn } from './lib/utils';
import { Button, buttonVariants, Input, Label, Textarea } from './index';

describe('ui package', () => {
  describe('Exports', () => {
    it('should export cn utility function', () => {
      expect(uiExports.cn).toBeDefined();
      expect(typeof uiExports.cn).toBe('function');
      expect(cn).toBe(uiExports.cn);
    });

    it('should export Button component', () => {
      expect(uiExports.Button).toBeDefined();
      expect(Button).toBe(uiExports.Button);
    });

    it('should export buttonVariants', () => {
      expect(uiExports.buttonVariants).toBeDefined();
      expect(buttonVariants).toBe(uiExports.buttonVariants);
    });

    it('should export Card components', () => {
      expect(uiExports.Card).toBeDefined();
      expect(uiExports.CardHeader).toBeDefined();
      expect(uiExports.CardFooter).toBeDefined();
      expect(uiExports.CardTitle).toBeDefined();
      expect(uiExports.CardDescription).toBeDefined();
      expect(uiExports.CardContent).toBeDefined();
    });

    it('should export Input component', () => {
      expect(uiExports.Input).toBeDefined();
      expect(Input).toBe(uiExports.Input);
    });

    it('should export Label component', () => {
      expect(uiExports.Label).toBeDefined();
      expect(Label).toBe(uiExports.Label);
    });

    it('should export Textarea component', () => {
      expect(uiExports.Textarea).toBeDefined();
      expect(Textarea).toBe(uiExports.Textarea);
    });
  });
});
