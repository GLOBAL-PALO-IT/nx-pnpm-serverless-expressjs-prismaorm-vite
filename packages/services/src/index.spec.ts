import * as services from './index';
import { authService, AuthService } from './auth.service';
import { userService, UserService } from './user.service';
import { postService, PostService } from './post.service';

describe('services package', () => {
  describe('Service exports', () => {
    it('should export authService instance', () => {
      expect(services.authService).toBeDefined();
      expect(services.authService).toBeInstanceOf(AuthService);
    });

    it('should export AuthService class', () => {
      expect(services.AuthService).toBeDefined();
      expect(typeof services.AuthService).toBe('function');
    });

    it('should export userService instance', () => {
      expect(services.userService).toBeDefined();
      expect(services.userService).toBeInstanceOf(UserService);
    });

    it('should export UserService class', () => {
      expect(services.UserService).toBeDefined();
      expect(typeof services.UserService).toBe('function');
    });

    it('should export postService instance', () => {
      expect(services.postService).toBeDefined();
      expect(services.postService).toBeInstanceOf(PostService);
    });

    it('should export PostService class', () => {
      expect(services.PostService).toBeDefined();
      expect(typeof services.PostService).toBe('function');
    });
  });

  describe('Service instances', () => {
    it('should have singleton instances', () => {
      expect(authService).toBe(services.authService);
      expect(userService).toBe(services.userService);
      expect(postService).toBe(services.postService);
    });
  });
});
