import * as services from './index';

describe('services index', () => {
  it('should export services', () => {
    expect(services).toBeDefined();
    expect(services.rootService).toBeDefined();
    expect(services.authService).toBeDefined();
    expect(services.userService).toBeDefined();
    expect(services.postService).toBeDefined();
  });
});
