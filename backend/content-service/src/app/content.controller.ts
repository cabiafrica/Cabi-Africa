import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ContentService, BlogPost, FAQ, Testimonial } from './content.service';

@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    // --- BLOG ---
    @Get('posts')
    getPosts() { return this.contentService.getAllPosts(); }

    @Get('posts/:slug')
    getPost(@Param('slug') slug: string) { return this.contentService.getPostBySlug(slug); }

    @Post('posts')
    createPost(@Body() post: BlogPost) { return this.contentService.createPost(post); }

    // --- FAQ ---
    @Get('faq')
    getFAQs() { return this.contentService.getAllFAQs(); }

    @Post('faq')
    saveFAQ(@Body() faq: FAQ) { return this.contentService.saveFAQ(faq); }

    // --- TESTIMONIALS ---
    @Get('testimonials')
    getTestimonials(@Query('featured') featured: boolean) {
        return featured ? this.contentService.getFeaturedTestimonials() : this.contentService.getAllTestimonials();
    }

    @Post('testimonials')
    saveTestimonial(@Body() t: Testimonial) { return this.contentService.saveTestimonial(t); }

    // --- PAGES ---
    @Get('pages/:id')
    getPage(@Param('id') id: string) { return this.contentService.getPageContent(id); }

    @Put('pages/:id')
    savePage(@Param('id') id: string, @Body() body: { content: string }) {
        return this.contentService.savePageContent(id, body.content);
    }
}
