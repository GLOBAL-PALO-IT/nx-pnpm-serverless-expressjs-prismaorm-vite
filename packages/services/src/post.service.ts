import { prisma, Post, Prisma } from '@nx-serverless/data';

export interface CreatePostInput {
  title: string;
  content?: string;
  published?: boolean;
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  published?: boolean;
}

export interface PostFilters {
  published?: boolean;
  authorId?: string;
  searchTerm?: string;
}

export class PostService {
  async getAllPosts(filters?: PostFilters): Promise<Post[]> {
    const where: Prisma.PostWhereInput = {};

    if (filters?.published !== undefined) {
      where.published = filters.published;
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.searchTerm) {
      where.OR = [
        {
          title: {
            contains: filters.searchTerm,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: filters.searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    return prisma.post.findMany({
      where,
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
  }

  async getPostById(id: string): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id },
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
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return prisma.post.findMany({
      where: { authorId },
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
  }

  async getPublishedPosts(): Promise<Post[]> {
    return this.getAllPosts({ published: true });
  }

  async createPost(data: CreatePostInput): Promise<Post> {
    try {
      // Verify that the author exists
      const author = await prisma.user.findUnique({
        where: { id: data.authorId },
      });

      if (!author) {
        throw new Error('Author not found');
      }

      return await prisma.post.create({
        data: {
          title: data.title,
          content: data.content,
          published: data.published ?? false,
          authorId: data.authorId,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('Author not found');
        }
      }
      throw error;
    }
  }

  async updatePost(id: string, data: UpdatePostInput): Promise<Post> {
    try {
      return await prisma.post.update({
        where: { id },
        data,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Post not found');
        }
      }
      throw error;
    }
  }

  async deletePost(id: string): Promise<Post> {
    try {
      return await prisma.post.delete({
        where: { id },
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Post not found');
        }
      }
      throw error;
    }
  }

  async togglePublishStatus(id: string): Promise<Post> {
    const post = await this.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    return this.updatePost(id, { published: !post.published });
  }

  async searchPosts(searchTerm: string): Promise<Post[]> {
    return this.getAllPosts({ searchTerm });
  }
}

export const postService = new PostService();
