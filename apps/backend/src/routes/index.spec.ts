import { authRouter, usersRouter, postsRouter } from './index';

describe('routes/index', () => {
  it('should export authRouter', () => {
    expect(authRouter).toBeDefined();
  });

  it('should export usersRouter', () => {
    expect(usersRouter).toBeDefined();
  });

  it('should export postsRouter', () => {
    expect(postsRouter).toBeDefined();
  });
});
