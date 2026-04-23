import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { PostStatus } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPosts() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPostById(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async createPost(data: any) {
    const slug = data.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
    
    return this.prisma.blogPost.create({
      data: {
        ...data,
        slug: `${slug}-${Date.now()}`,
      },
    });
  }

  async updatePost(id: string, data: any) {
    const post = await this.getPostById(id);
    
    // Auto-set publishedDate if status changes to PUBLISHED
    if (data.status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
      data.publishedDate = new Date();
    }

    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async deletePost(id: string) {
    await this.getPostById(id);
    return this.prisma.blogPost.delete({
      where: { id },
    });
  }
}
