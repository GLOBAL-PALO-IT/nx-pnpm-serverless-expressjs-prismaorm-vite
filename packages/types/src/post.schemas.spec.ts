import {
  PostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostIdSchema,
  AuthorIdSchema,
  PostQuerySchema,
} from './post.schemas';

describe('Post Schemas', () => {
  describe('PostSchema', () => {
    it('should validate valid post data', () => {
      const validData = {
        id: 'clxyz123456789',
        title: 'Test Post',
        content: 'Test content',
        published: true,
        authorId: 'clxyz123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(() => PostSchema.parse(validData)).not.toThrow();
    });

    it('should validate post with optional fields', () => {
      const validData = {
        title: 'Test Post',
        authorId: 'clxyz123456789',
      };
      const result = PostSchema.parse(validData);
      expect(result.published).toBe(false); // default value
    });

    it('should reject missing title', () => {
      const invalidData = {
        authorId: 'clxyz123456789',
      };
      expect(() => PostSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        authorId: 'clxyz123456789',
      };
      expect(() => PostSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid authorId', () => {
      const invalidData = {
        title: 'Test Post',
        authorId: 'invalid-id',
      };
      expect(() => PostSchema.parse(invalidData)).toThrow();
    });
  });

  describe('CreatePostSchema', () => {
    it('should validate valid create post data', () => {
      const validData = {
        title: 'Test Post',
        content: 'Test content',
        published: true,
      };
      expect(() => CreatePostSchema.parse(validData)).not.toThrow();
    });

    it('should validate minimal create post data', () => {
      const validData = {
        title: 'Test Post',
      };
      const result = CreatePostSchema.parse(validData);
      expect(result.published).toBe(false); // default value
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
      };
      expect(() => CreatePostSchema.parse(invalidData)).toThrow();
    });

    it('should reject title longer than 200 characters', () => {
      const invalidData = {
        title: 'A'.repeat(201),
      };
      expect(() => CreatePostSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing title', () => {
      const invalidData = {};
      expect(() => CreatePostSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UpdatePostSchema', () => {
    it('should validate update with title', () => {
      const validData = {
        title: 'Updated Title',
      };
      expect(() => UpdatePostSchema.parse(validData)).not.toThrow();
    });

    it('should validate update with content', () => {
      const validData = {
        content: 'Updated content',
      };
      expect(() => UpdatePostSchema.parse(validData)).not.toThrow();
    });

    it('should validate update with published', () => {
      const validData = {
        published: true,
      };
      expect(() => UpdatePostSchema.parse(validData)).not.toThrow();
    });

    it('should validate empty update', () => {
      const validData = {};
      expect(() => UpdatePostSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty title when provided', () => {
      const invalidData = {
        title: '',
      };
      expect(() => UpdatePostSchema.parse(invalidData)).toThrow();
    });

    it('should reject title longer than 200 characters', () => {
      const invalidData = {
        title: 'A'.repeat(201),
      };
      expect(() => UpdatePostSchema.parse(invalidData)).toThrow();
    });
  });

  describe('PostIdSchema', () => {
    it('should validate valid post ID', () => {
      const validData = {
        id: 'clxyz123456789',
      };
      expect(() => PostIdSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid post ID', () => {
      const invalidData = {
        id: 'invalid-id',
      };
      expect(() => PostIdSchema.parse(invalidData)).toThrow();
    });
  });

  describe('AuthorIdSchema', () => {
    it('should validate valid author ID', () => {
      const validData = {
        authorId: 'clxyz123456789',
      };
      expect(() => AuthorIdSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid author ID', () => {
      const invalidData = {
        authorId: 'invalid-id',
      };
      expect(() => AuthorIdSchema.parse(invalidData)).toThrow();
    });
  });

  describe('PostQuerySchema', () => {
    it('should parse published as true', () => {
      const data = {
        published: 'true',
      };
      const result = PostQuerySchema.parse(data);
      expect(result.published).toBe(true);
    });

    it('should parse published as false', () => {
      const data = {
        published: 'false',
      };
      const result = PostQuerySchema.parse(data);
      expect(result.published).toBe(false);
    });

    it('should handle missing published', () => {
      const data = {};
      const result = PostQuerySchema.parse(data);
      expect(result.published).toBeUndefined();
    });

    it('should handle search parameter', () => {
      const data = {
        search: 'test query',
      };
      const result = PostQuerySchema.parse(data);
      expect(result.search).toBe('test query');
    });

    it('should handle both published and search', () => {
      const data = {
        published: 'true',
        search: 'test',
      };
      const result = PostQuerySchema.parse(data);
      expect(result.published).toBe(true);
      expect(result.search).toBe('test');
    });
  });
});
