import { Route } from './login';

describe('login route', () => {
  it('should export Route configuration', () => {
    expect(Route).toBeDefined();
    expect(Route.options).toBeDefined();
  });

  it('should have component defined', () => {
    expect(Route.options.component).toBeDefined();
  });

  it('should have beforeLoad guard', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });
});
