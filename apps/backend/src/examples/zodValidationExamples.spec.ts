import {
  SimpleUserSchema,
  IdParamSchema,
  UserQuerySchema,
  UpdateUserSchema,
  PostSchema,
  BulkCreateUsersSchema,
  UserWithAddressSchema,
  UserWithAgeSchema,
  SearchQuerySchema,
} from './zodValidationExamples';

describe('zodValidationExamples', () => {
  describe('SimpleUserSchema', () => {
    it('should validate valid user data', () => {
      const validData = { name: 'John Doe', email: 'john@example.com' };
      expect(() => SimpleUserSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = { name: 'John Doe', email: 'invalid-email' };
      expect(() => SimpleUserSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty name', () => {
      const invalidData = { name: '', email: 'john@example.com' };
      expect(() => SimpleUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe('IdParamSchema', () => {
    it('should validate valid UUID', () => {
      const validData = { id: '123e4567-e89b-12d3-a456-426614174000' };
      expect(() => IdParamSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidData = { id: 'not-a-uuid' };
      expect(() => IdParamSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UserQuerySchema', () => {
    it('should parse valid query params', () => {
      const validData = { page: '2', limit: '20', active: 'true' };
      const result = UserQuerySchema.parse(validData);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.active).toBe(true);
    });

    it('should use default values when optional fields missing', () => {
      const validData = {};
      const result = UserQuerySchema.parse(validData);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should transform active string to boolean', () => {
      const result = UserQuerySchema.parse({ active: 'false' });
      expect(result.active).toBe(false);
    });
  });

  describe('UpdateUserSchema', () => {
    it('should validate partial user updates', () => {
      const validData = { name: 'Updated Name' };
      expect(() => UpdateUserSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty object', () => {
      const validData = {};
      expect(() => UpdateUserSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = { email: 'invalid' };
      expect(() => UpdateUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe('PostSchema', () => {
    it('should validate unpublished post', () => {
      const validData = {
        title: 'Test Post',
        content: 'Content',
        published: false,
      };
      expect(() => PostSchema.parse(validData)).not.toThrow();
    });

    it('should validate published post with publishedAt', () => {
      const validData = {
        title: 'Test Post',
        content: 'Content',
        published: true,
        publishedAt: new Date().toISOString(),
      };
      expect(() => PostSchema.parse(validData)).not.toThrow();
    });

    it('should reject published post without publishedAt', () => {
      const invalidData = { title: 'Test Post', published: true };
      expect(() => PostSchema.parse(invalidData)).toThrow();
    });

    it('should default published to false', () => {
      const data = { title: 'Test Post' };
      const result = PostSchema.parse(data);
      expect(result.published).toBe(false);
    });
  });

  describe('BulkCreateUsersSchema', () => {
    it('should validate array of users', () => {
      const validData = {
        users: [
          { name: 'User 1', email: 'user1@example.com' },
          { name: 'User 2', email: 'user2@example.com' },
        ],
      };
      expect(() => BulkCreateUsersSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty array', () => {
      const invalidData = { users: [] };
      expect(() => BulkCreateUsersSchema.parse(invalidData)).toThrow();
    });

    it('should reject too many users', () => {
      const invalidData = {
        users: Array(101).fill({ name: 'User', email: 'user@example.com' }),
      };
      expect(() => BulkCreateUsersSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid user in array', () => {
      const invalidData = {
        users: [{ name: 'User 1', email: 'invalid-email' }],
      };
      expect(() => BulkCreateUsersSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UserWithAddressSchema', () => {
    it('should validate user with address', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          zipCode: '12345',
        },
      };
      expect(() => UserWithAddressSchema.parse(validData)).not.toThrow();
    });

    it('should validate user without address', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      expect(() => UserWithAddressSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid zipCode', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          zipCode: 'ABC',
        },
      };
      expect(() => UserWithAddressSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UserWithAgeSchema', () => {
    it('should validate user with valid age', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };
      expect(() => UserWithAgeSchema.parse(validData)).not.toThrow();
    });

    it('should reject negative age', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: -5,
      };
      expect(() => UserWithAgeSchema.parse(invalidData)).toThrow();
    });

    it('should reject age over 150', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 200,
      };
      expect(() => UserWithAgeSchema.parse(invalidData)).toThrow();
    });

    it('should accept age at boundaries', () => {
      expect(() =>
        UserWithAgeSchema.parse({
          name: 'John',
          email: 'john@example.com',
          age: 0,
        })
      ).not.toThrow();
      expect(() =>
        UserWithAgeSchema.parse({
          name: 'John',
          email: 'john@example.com',
          age: 150,
        })
      ).not.toThrow();
    });
  });

  describe('SearchQuerySchema', () => {
    it('should transform query to lowercase', () => {
      const data = { query: 'TEST QUERY' };
      const result = SearchQuerySchema.parse(data);
      expect(result.query).toBe('test query');
    });

    it('should trim whitespace from query', () => {
      const data = { query: '  test query  ' };
      const result = SearchQuerySchema.parse(data);
      expect(result.query).toBe('test query');
    });

    it('should transform tags string to array', () => {
      const data = { query: 'test', tags: 'tag1,tag2,tag3' };
      const result = SearchQuerySchema.parse(data);
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should handle missing tags', () => {
      const data = { query: 'test' };
      const result = SearchQuerySchema.parse(data);
      expect(result.tags).toEqual([]);
    });

    it('should trim tags', () => {
      const data = { query: 'test', tags: ' tag1 , tag2 , tag3 ' };
      const result = SearchQuerySchema.parse(data);
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should reject empty query', () => {
      const invalidData = { query: '' };
      expect(() => SearchQuerySchema.parse(invalidData)).toThrow();
    });
  });
});
