import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserIdSchema,
  UserEmailSchema,
  UserQuerySchema,
} from './user.schemas';

describe('User Schemas', () => {
  describe('UserSchema', () => {
    it('should validate valid user data', () => {
      const validData = {
        id: 'clxyz123456789',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(() => UserSchema.parse(validData)).not.toThrow();
    });

    it('should validate user with optional fields missing', () => {
      const validData = {
        email: 'test@example.com',
      };
      expect(() => UserSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'notanemail',
      };
      expect(() => UserSchema.parse(invalidData)).toThrow();
    });
  });

  describe('CreateUserSchema', () => {
    it('should validate valid create user data', () => {
      const validData = {
        email: 'test@example.com',
        name: 'Test User',
      };
      expect(() => CreateUserSchema.parse(validData)).not.toThrow();
    });

    it('should validate without name', () => {
      const validData = {
        email: 'test@example.com',
      };
      expect(() => CreateUserSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'notanemail',
        name: 'Test User',
      };
      expect(() => CreateUserSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty name when provided', () => {
      const invalidData = {
        email: 'test@example.com',
        name: '',
      };
      expect(() => CreateUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UpdateUserSchema', () => {
    it('should validate update user data with email', () => {
      const validData = {
        email: 'newemail@example.com',
      };
      expect(() => UpdateUserSchema.parse(validData)).not.toThrow();
    });

    it('should validate update user data with name', () => {
      const validData = {
        name: 'New Name',
      };
      expect(() => UpdateUserSchema.parse(validData)).not.toThrow();
    });

    it('should validate empty update data', () => {
      const validData = {};
      expect(() => UpdateUserSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email when provided', () => {
      const invalidData = {
        email: 'notanemail',
      };
      expect(() => UpdateUserSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty name when provided', () => {
      const invalidData = {
        name: '',
      };
      expect(() => UpdateUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UserIdSchema', () => {
    it('should validate valid CUID', () => {
      const validData = {
        id: 'clxyz123456789',
      };
      expect(() => UserIdSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid CUID format', () => {
      const invalidData = {
        id: 'invalid-id',
      };
      expect(() => UserIdSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UserEmailSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        email: 'test@example.com',
      };
      expect(() => UserEmailSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'notanemail',
      };
      expect(() => UserEmailSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UserQuerySchema', () => {
    it('should parse includePostCount as true', () => {
      const data = {
        includePostCount: 'true',
      };
      const result = UserQuerySchema.parse(data);
      expect(result.includePostCount).toBe(true);
    });

    it('should parse includePostCount as false for any other value', () => {
      const data = {
        includePostCount: 'false',
      };
      const result = UserQuerySchema.parse(data);
      expect(result.includePostCount).toBe(false);
    });

    it('should handle missing includePostCount', () => {
      const data = {};
      const result = UserQuerySchema.parse(data);
      // The transform sets it to false when undefined
      expect(result.includePostCount).toBe(false);
    });
  });
});
