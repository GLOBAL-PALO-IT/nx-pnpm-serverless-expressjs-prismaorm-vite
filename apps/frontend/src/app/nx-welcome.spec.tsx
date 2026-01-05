import { NxWelcome } from './nx-welcome';

describe('NxWelcome', () => {
  it('should accept title prop', () => {
    const title = 'Test Title';
    const component = NxWelcome({ title });
    expect(component).toBeDefined();
  });
});
