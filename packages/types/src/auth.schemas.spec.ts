import {
  ChangePasswordSchema,
  LoginSchema,
  LogoutSchema,
  RefreshTokenSchema,
  RegisterSchema,
} from './auth.schemas';

describe('Auth Schemas', () => {
  describe('LoginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => LoginSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'password123',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('RegisterSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };
      expect(() => RegisterSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        name: 'Test User',
        password: 'password123',
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'notanemail',
        name: 'Test User',
        password: 'password123',
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty name', () => {
      const invalidData = {
        email: 'test@example.com',
        name: '',
        password: 'password123',
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'A',
        password: 'password123',
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });

    it('should reject name longer than 100 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'A'.repeat(101),
        password: 'password123',
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: '',
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: '12345',
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });

    it('should reject password longer than 128 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'A'.repeat(129),
      };
      expect(() => RegisterSchema.parse(invalidData)).toThrow();
    });
  });

  describe('RefreshTokenSchema', () => {
    it('should validate valid refresh token', () => {
      const validData = {
        refreshToken: 'valid-token-string',
      };
      expect(() => RefreshTokenSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty refresh token', () => {
      const invalidData = {
        refreshToken: '',
      };
      expect(() => RefreshTokenSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing refresh token', () => {
      const invalidData = {};
      expect(() => RefreshTokenSchema.parse(invalidData)).toThrow();
    });
  });

  describe('LogoutSchema', () => {
    it('should validate valid logout data', () => {
      const validData = {
        refreshToken: 'valid-token-string',
      };
      expect(() => LogoutSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty refresh token', () => {
      const invalidData = {
        refreshToken: '',
      };
      expect(() => LogoutSchema.parse(invalidData)).toThrow();
    });
  });

  describe('ChangePasswordSchema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
      };
      expect(() => ChangePasswordSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty current password', () => {
      const invalidData = {
        currentPassword: '',
        newPassword: 'newpass123',
      };
      expect(() => ChangePasswordSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty new password', () => {
      const invalidData = {
        currentPassword: 'oldpass123',
        newPassword: '',
      };
      expect(() => ChangePasswordSchema.parse(invalidData)).toThrow();
    });

    it('should reject new password shorter than 6 characters', () => {
      const invalidData = {
        currentPassword: 'oldpass123',
        newPassword: '12345',
      };
      expect(() => ChangePasswordSchema.parse(invalidData)).toThrow();
    });

    it('should reject new password longer than 128 characters', () => {
      const invalidData = {
        currentPassword: 'oldpass123',
        newPassword: 'A'.repeat(129),
      };
      expect(() => ChangePasswordSchema.parse(invalidData)).toThrow();
    });
  });
});
