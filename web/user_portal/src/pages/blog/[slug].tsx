import { GetStaticProps, GetStaticPaths } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/blog/sidebar/Sidebar';
import AppSidebar from '../../components/blog/sidebar/AppSidebar';
import { getPostBySlug, getAllPosts, getAllCategories, BlogPost, BlogPostSummary } from '@/backend/services/cms';

function sanitizeHtml(html: string): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
            'p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'br', 'table',
            'thead', 'tbody', 'tr', 'th', 'td', 'img', 'span', 'figure', 'figcaption'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'width', 'height'],
    });
}

interface BlogPostPageProps {
    post: BlogPost;
    recentPosts: BlogPostSummary[];
    categories: string[];
}

export default function BlogPostPage({ post, recentPosts, categories }: BlogPostPageProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (router.isFallback || !post) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white">Loading...</div>;
    }

    const safeRecentPosts = Array.isArray(recentPosts) ? recentPosts : [];
    const safeCategories = Array.isArray(categories) ? categories : ['Technology', 'Lifestyle', 'Updates'];

    return (
        <MainLayout
            title={`${post.title} | CABI Intel`}
            description={post.summary}
            image={post.imageUrl}
            imageAlt={`${post.title} — CABI Africa Intel Editorial Photography`}
        >
            <Head>
                {/* Structured Data: Schema.org BlogPosting & ImageObject */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BlogPosting',
                            headline: post.title,
                            description: post.summary,
                            image: {
                                '@type': 'ImageObject',
                                url: post.imageUrl?.startsWith('http') ? post.imageUrl : `https://cabi.africa${post.imageUrl}`,
                                caption: `${post.title} — CABI Africa Intel Editorial Photography`,
                                width: 1200,
                                height: 675,
                            },
                            author: {
                                '@type': 'Organization',
                                name: post.authorName || 'CABI Editorial Team',
                                url: 'https://cabi.africa',
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: 'CABI FAST AFRICA LIMITED',
                                logo: {
                                    '@type': 'ImageObject',
                                    url: 'https://cabi.africa/images/cabi-logo-dark.png',
                                },
                            },
                            datePublished: post.publishedDate,
                            dateModified: post.publishedDate,
                            mainEntityOfPage: {
                                '@type': 'WebPage',
                                '@id': `https://cabi.africa/blog/${post.slug || post.id}`,
                            },
                        }).replace(/</g, '\\u003c'),
                    }}
                />
            </Head>

            {/* Editorial Article Hero Banner (Obsidian-Gold Identity) */}
            <section className="relative bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white pt-8 pb-10 sm:pt-12 sm:pb-14 overflow-hidden border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
                <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[440px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] hover:text-[#ffe088] transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Intel</span>
                            </Link>
                            <span className="inline-flex items-center rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                                {post.category || 'Editorial'}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.12]">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-x-4">
                            <div className="h-11 w-11 rounded-full bg-[#D4AF37] flex items-center justify-center font-black text-black text-base shadow-sm shrink-0">
                                {post.authorName?.charAt(0) || 'C'}
                            </div>
                            <div className="text-sm leading-6">
                                <p className="font-bold text-slate-900 dark:text-white m-0">
                                    {post.authorName}
                                </p>
                                <p className="text-neutral-500 dark:text-neutral-400 m-0 text-xs sm:text-sm">
                                    {mounted && new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    {post.readTime && <> &middot; <span>{post.readTime}</span></>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 dark:bg-surface-dark py-8 lg:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <div className="mx-auto max-w-[1600px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

                        {/* LEFT: Stationary Blog Sidebar */}
                        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-hide">
                            <Sidebar recentPosts={safeRecentPosts} categories={safeCategories} />
                        </div>

                        {/* CENTER: Article Content */}
                        <div className="lg:col-span-6 w-full">
                            <article className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-5 sm:p-8 md:p-10 prose dark:prose-invert prose-base sm:prose-lg max-w-none overflow-hidden">
                                {post.imageUrl && (
                                    <figure className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 not-prose bg-surface-dark border border-white/10 mt-0">
                                        <Image
                                            src={post.imageUrl}
                                            alt={`${post.title} — CABI Africa urban mobility editorial photography`}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 1024px) 100vw, 900px"
                                            className="object-cover"
                                            priority
                                        />
                                    </figure>
                                )}

                                <div
                                    className="prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-[#D4AF37] hover:prose-a:text-[#ffe088] break-words"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                                />
                            </article>
                        </div>

                        {/* RIGHT: Stationary App Sidebar */}
                        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-hide">
                            <AppSidebar />

                            {/* Mobile-only Left Sidebar Stack */}
                            <div className="lg:hidden mt-8 pt-8 border-t border-slate-200 dark:border-white/10">
                                <Sidebar recentPosts={safeRecentPosts} categories={safeCategories} />
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </MainLayout>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const rawPosts = await getAllPosts();
    const posts = Array.isArray(rawPosts) ? rawPosts : [];
    const paths = posts.map((post) => ({
        params: { slug: post.id },
    }));

    return {
        paths,
        fallback: true,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const slug = params?.slug as string;
    const post = await getPostBySlug(slug);
    const rawRecentPosts = await getAllPosts();
    const rawCategories = await getAllCategories();

    if (!post) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            post,
            recentPosts: Array.isArray(rawRecentPosts) ? rawRecentPosts : [],
            categories: Array.isArray(rawCategories) ? rawCategories : ['Technology', 'Lifestyle', 'Updates'],
        },
        revalidate: 60,
    };
};
