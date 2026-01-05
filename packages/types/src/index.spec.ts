import * as schemas from './index';

describe('types package', () => {
  describe('Index exports', () => {
    it('should export all auth schemas', () => {
      expect(schemas.LoginSchema).toBeDefined();
      expect(schemas.RegisterSchema).toBeDefined();
      expect(schemas.RefreshTokenSchema).toBeDefined();
      expect(schemas.LogoutSchema).toBeDefined();
      expect(schemas.ChangePasswordSchema).toBeDefined();
    });

    it('should export all user schemas', () => {
      expect(schemas.UserSchema).toBeDefined();
      expect(schemas.CreateUserSchema).toBeDefined();
      expect(schemas.UpdateUserSchema).toBeDefined();
      expect(schemas.UserIdSchema).toBeDefined();
      expect(schemas.UserEmailSchema).toBeDefined();
      expect(schemas.UserQuerySchema).toBeDefined();
    });

    it('should export all post schemas', () => {
      expect(schemas.PostSchema).toBeDefined();
      expect(schemas.CreatePostSchema).toBeDefined();
      expect(schemas.UpdatePostSchema).toBeDefined();
      expect(schemas.PostIdSchema).toBeDefined();
      expect(schemas.AuthorIdSchema).toBeDefined();
      expect(schemas.PostQuerySchema).toBeDefined();
    });
  });
});
