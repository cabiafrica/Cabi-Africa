import { Injectable } from '@nestjs/common';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt: Date;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
}

export interface Testimonial {
    id: string;
    driverName: string;
    quote: string;
    featured: boolean;
    photoUrl?: string;
}

@Injectable()
export class ContentService {
    private posts: BlogPost[] = [];
    private faqs: FAQ[] = [];
    private testimonials: Testimonial[] = [];
    private pageContent: Map<string, any> = new Map(); // PageID -> Content (HTML or JSON object)

    constructor() {
        // Seed some data
        this.posts.push({
            id: '1',
            title: 'Welcome to Cabi',
            slug: 'welcome',
            content: 'We are excited to launch...',
            author: 'Admin',
            status: 'PUBLISHED',
            publishedAt: new Date()
        });

        // Seed Page Content
        this.pageContent.set('about-us', '<h1>About Cabi</h1><p>Our mission is to revolutionize ride-sharing.</p>');
        this.pageContent.set('homepage', {
            heroTitle: 'Drive Your Way',
            heroSubtitle: 'Earn more with Cabi. The driver-first platform.',
            ctaText: 'Get Started'
        });
    }

    // --- BLOG ---
    getAllPosts() { return this.posts; }
    getPostBySlug(slug: string) { return this.posts.find(p => p.slug === slug); }
    createPost(post: BlogPost) { this.posts.push(post); return post; }
    updatePost(id: string, update: Partial<BlogPost>) {
        const idx = this.posts.findIndex(p => p.id === id);
        if (idx > -1) {
            this.posts[idx] = { ...this.posts[idx], ...update };
            return this.posts[idx];
        }
        return null;
    }

    // --- FAQ ---
    getAllFAQs() { return this.faqs.sort((a, b) => a.order - b.order); }
    saveFAQ(faq: FAQ) {
        const idx = this.faqs.findIndex(f => f.id === faq.id);
        if (idx > -1) this.faqs[idx] = faq;
        else this.faqs.push(faq);
        return faq;
    }

    // --- TESTIMONIALS ---
    getAllTestimonials() { return this.testimonials; }
    getFeaturedTestimonials() { return this.testimonials.filter(t => t.featured); }
    saveTestimonial(t: Testimonial) {
        const idx = this.testimonials.findIndex(rx => rx.id === t.id);
        if (idx > -1) this.testimonials[idx] = t;
        else this.testimonials.push(t);
        return t;
    }

    // --- PAGES (Why Drive, About, Homepage) ---
    getPageContent(pageId: string) { return this.pageContent.get(pageId) || null; }

    savePageContent(pageId: string, content: any) {
        this.pageContent.set(pageId, content);
        return { pageId, content };
    }
}
