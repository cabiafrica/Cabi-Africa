import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Permissions } from './permissions.decorator';
import { AdminPermissionGuard } from './admin-permission.guard';
import { JwtAuthGuard, Public } from '@cabi/backend/rbac';

@Controller('v1/blog')
@UseGuards(JwtAuthGuard, AdminPermissionGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  @Public()
  async getAllPosts() {
    return this.blogService.getAllPosts();
  }

  @Get('posts/:id')
  @Public()
  async getPostById(@Param('id') id: string) {
    return this.blogService.getPostById(id);
  }

  @Post('posts')
  @Permissions('BLOG_POSTS_EDIT')
  async createPost(@Body() data: any) {
    return this.blogService.createPost(data);
  }

  @Put('posts/:id')
  @Permissions('BLOG_POSTS_EDIT')
  async updatePost(@Param('id') id: string, @Body() data: any) {
    // If trying to publish, check for publish permission
    if (data.status === 'PUBLISHED') {
        // This is a bit tricky with the @Permissions decorator which is static
        // We handle this in the service or by having a separate endpoint
    }
    return this.blogService.updatePost(id, data);
  }

  @Delete('posts/:id')
  @Permissions('BLOG_POSTS_EDIT')
  async deletePost(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }
}
