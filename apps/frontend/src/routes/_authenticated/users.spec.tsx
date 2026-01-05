import { Route } from './users';

describe('_authenticated/users route', () => {
  it('should export Route configuration', () => {
    expect(Route).toBeDefined();
    expect(Route.options).toBeDefined();
  });

  it('should have component defined', () => {
    expect(Route.options.component).toBeDefined();
  });
});
