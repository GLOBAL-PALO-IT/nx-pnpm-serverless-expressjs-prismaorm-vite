import { Route } from './index';

describe('_authenticated/index route', () => {
  it('should export Route configuration', () => {
    expect(Route).toBeDefined();
    expect(Route.options).toBeDefined();
  });

  it('should have component defined', () => {
    expect(Route.options.component).toBeDefined();
  });
});
