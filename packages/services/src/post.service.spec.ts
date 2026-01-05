import { PostService } from './post.service';
import { prisma, Prisma } from '@nx-serverless/data';

// Mock the dependencies
jest.mock('@nx-serverless/data', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code: string;
      constructor(message: string, code: string) {
        super(message);
        this.code = code;
        this.name = 'PrismaClientKnownRequestError';
      }
    },
  },
}));

describe('PostService', () => {
  let postService: PostService;

  beforeEach(() => {
    jest.clearAllMocks();
    postService = new PostService();
  });

  describe('getAllPosts', () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'Post 1',
        content: 'Content 1',
        published: true,
        authorId: 'user-1',
        author: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
      },
    ];

    it('should return all posts without filters', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const result = await postService.getAllPosts();

      expect(result).toEqual(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter by published status', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      await postService.getAllPosts({ published: true });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true },
        })
      );
    });

    it('should filter by authorId', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      await postService.getAllPosts({ authorId: 'user-1' });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { authorId: 'user-1' },
        })
      );
    });

    it('should filter by search term', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      await postService.getAllPosts({ searchTerm: 'test' });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                title: {
                  contains: 'test',
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: 'test',
                  mode: 'insensitive',
                },
              },
            ],
          },
        })
      );
    });

    it('should combine multiple filters', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      await postService.getAllPosts({
        published: true,
        authorId: 'user-1',
        searchTerm: 'test',
      });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            published: true,
            authorId: 'user-1',
            OR: expect.any(Array),
          },
        })
      );
    });

    it('should handle published filter as false', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      await postService.getAllPosts({ published: false });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: false },
        })
      );
    });

    it('should not filter by published when undefined', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      await postService.getAllPosts({});

      const call = (prisma.post.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.published).toBeUndefined();
    });
  });

  describe('getPostById', () => {
    it('should return post by ID with author', async () => {
      const postId = 'post-123';
      const mockPost = {
        id: postId,
        title: 'Test Post',
        content: 'Test content',
        published: true,
        authorId: 'user-1',
        author: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      const result = await postService.getPostById(postId);

      expect(result).toEqual(mockPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should return null if post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await postService.getPostById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getPostsByAuthor', () => {
    it('should return posts by author', async () => {
      const authorId = 'user-1';
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Post 1',
          authorId: authorId,
          author: {
            id: authorId,
            email: 'user1@example.com',
            name: 'User 1',
          },
        },
      ];

      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const result = await postService.getPostsByAuthor(authorId);

      expect(result).toEqual(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: authorId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getPublishedPosts', () => {
    it('should return only published posts', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Published Post',
          published: true,
          authorId: 'user-1',
          author: {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User 1',
          },
        },
      ];

      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const result = await postService.getPublishedPosts();

      expect(result).toEqual(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true },
        })
      );
    });
  });

  describe('createPost', () => {
    const createData = {
      title: 'New Post',
      content: 'New content',
      published: false,
      authorId: 'user-1',
    };

    it('should create a post successfully', async () => {
      const mockCreatedPost = {
        id: 'post-123',
        ...createData,
        author: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
      });
      (prisma.post.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      const result = await postService.createPost(createData);

      expect(result).toEqual(mockCreatedPost);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: createData.authorId },
      });
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          title: createData.title,
          content: createData.content,
          published: createData.published,
          authorId: createData.authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw error if author not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(postService.createPost(createData)).rejects.toThrow(
        'Author not found'
      );
    });

    it('should handle Prisma P2003 error (foreign key constraint)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
      });
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Foreign key constraint failed',
        'P2003'
      );
      (prisma.post.create as jest.Mock).mockRejectedValue(error);

      await expect(postService.createPost(createData)).rejects.toThrow(
        'Author not found'
      );
    });

    it('should rethrow other errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
      });
      const error = new Error('Generic error');
      (prisma.post.create as jest.Mock).mockRejectedValue(error);

      await expect(postService.createPost(createData)).rejects.toThrow(error);
    });

    it('should handle other Prisma errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
      });
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Other error',
        'P9999'
      );
      (prisma.post.create as jest.Mock).mockRejectedValue(error);

      await expect(postService.createPost(createData)).rejects.toThrow(error);
    });

    it('should use default published value when not provided', async () => {
      const dataWithoutPublished = {
        title: 'New Post',
        content: 'New content',
        authorId: 'user-1',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
      });
      (prisma.post.create as jest.Mock).mockResolvedValue({
        id: 'post-123',
        ...dataWithoutPublished,
        published: false,
      });

      await postService.createPost(dataWithoutPublished);

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            published: false,
          }),
        })
      );
    });
  });

  describe('updatePost', () => {
    const postId = 'post-123';
    const updateData = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    it('should update post successfully', async () => {
      const mockUpdatedPost = {
        id: postId,
        ...updateData,
        published: true,
        authorId: 'user-1',
        author: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
      };

      (prisma.post.update as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const result = await postService.updatePost(postId, updateData);

      expect(result).toEqual(mockUpdatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw error if post not found', async () => {
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Record not found',
        'P2025'
      );
      (prisma.post.update as jest.Mock).mockRejectedValue(error);

      await expect(postService.updatePost(postId, updateData)).rejects.toThrow(
        'Post not found'
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Generic error');
      (prisma.post.update as jest.Mock).mockRejectedValue(error);

      await expect(postService.updatePost(postId, updateData)).rejects.toThrow(
        error
      );
    });

    it('should handle other Prisma errors', async () => {
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Other error',
        'P9999'
      );
      (prisma.post.update as jest.Mock).mockRejectedValue(error);

      await expect(postService.updatePost(postId, updateData)).rejects.toThrow(
        error
      );
    });
  });

  describe('deletePost', () => {
    const postId = 'post-123';

    it('should delete post successfully', async () => {
      const mockDeletedPost = {
        id: postId,
        title: 'Deleted Post',
        content: 'Content',
        published: true,
        authorId: 'user-1',
        author: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
      };

      (prisma.post.delete as jest.Mock).mockResolvedValue(mockDeletedPost);

      const result = await postService.deletePost(postId);

      expect(result).toEqual(mockDeletedPost);
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw error if post not found', async () => {
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Record not found',
        'P2025'
      );
      (prisma.post.delete as jest.Mock).mockRejectedValue(error);

      await expect(postService.deletePost(postId)).rejects.toThrow(
        'Post not found'
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Generic error');
      (prisma.post.delete as jest.Mock).mockRejectedValue(error);

      await expect(postService.deletePost(postId)).rejects.toThrow(error);
    });

    it('should handle other Prisma errors', async () => {
      const error = new (Prisma.PrismaClientKnownRequestError as any)(
        'Other error',
        'P9999'
      );
      (prisma.post.delete as jest.Mock).mockRejectedValue(error);

      await expect(postService.deletePost(postId)).rejects.toThrow(error);
    });
  });

  describe('togglePublishStatus', () => {
    const postId = 'post-123';

    it('should toggle published from false to true', async () => {
      const mockPost = {
        id: postId,
        title: 'Test Post',
        published: false,
        authorId: 'user-1',
        author: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
      };

      const mockUpdatedPost = {
        ...mockPost,
        published: true,
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const result = await postService.togglePublishStatus(postId);

      expect(result).toEqual(mockUpdatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: { published: true },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should toggle published from true to false', async () => {
      const mockPost = {
        id: postId,
        title: 'Test Post',
        published: true,
        authorId: 'user-1',
        author: { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
      };

      const mockUpdatedPost = {
        ...mockPost,
        published: false,
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const result = await postService.togglePublishStatus(postId);

      expect(result).toEqual(mockUpdatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: { published: false },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw error if post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(postService.togglePublishStatus(postId)).rejects.toThrow(
        'Post not found'
      );
    });
  });

  describe('searchPosts', () => {
    it('should search posts by search term', async () => {
      const searchTerm = 'test query';
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Test Post',
          content: 'Test query content',
          published: true,
          authorId: 'user-1',
          author: {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User 1',
          },
        },
      ];

      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const result = await postService.searchPosts(searchTerm);

      expect(result).toEqual(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                title: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            ],
          },
        })
      );
    });
  });
});
