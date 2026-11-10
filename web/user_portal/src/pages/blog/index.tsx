import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Sparkles } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import PostSummaryCard from '../../components/PostSummaryCard';
import AppSidebar from '../../components/blog/sidebar/AppSidebar';
import { getPostSummaries, getAllCategories, BlogPostSummary } from '@/backend/services/cms';

interface BlogIndexProps {
    posts: BlogPostSummary[];
    categories: string[];
}

export default function BlogIndex({ posts, categories }: BlogIndexProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        if (router.query.category) {
            setSelectedCategory(router.query.category as string);
        }
    }, [router.query.category]);

    const safeCategories = Array.isArray(categories) ? categories : ['Technology', 'Lifestyle', 'Updates'];
    const safePosts = Array.isArray(posts) ? posts : [];
    const filteredPosts = selectedCategory === 'All'
        ? safePosts
        : safePosts.filter((post) => post.category === selectedCategory);

    return (
        <MainLayout title="Intel | CABI" description="Stories, mobility insights, and updates from across the CABI network.">
            {/* Full-Width Hero Banner (Scrolls out on scroll, matching Single Blog Page) */}
            <section
                aria-label="Intel overview"
                className="relative bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white pt-10 pb-12 sm:pt-14 sm:pb-16 overflow-hidden border-b border-slate-200 dark:border-white/10 transition-colors duration-300"
            >
                <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[440px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] border border-[#D4AF37]/30 shadow-sm mb-5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
                            Editorial &amp; Insights
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                        Latest{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                            Intel.
                        </span>
                    </h1>
                    <p className="mt-4 text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                        Stories, city mobility perspectives, and product announcements from the CABI community.
                    </p>
                </div>
            </section>

            <section className="bg-slate-50 dark:bg-surface-dark py-8 lg:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <div className="mx-auto max-w-[1600px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                        {/* LEFT: Stationary Sticky Categories Sidebar */}
                        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-hide">
                            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
                                <div className="mb-4 flex items-center gap-2.5">
                                    <span className="h-px w-6 bg-[#D4AF37] opacity-60" />
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">
                                        Categories
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {['All', ...safeCategories].map((category) => {
                                        const isActive = selectedCategory === category;
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                    isActive
                                                        ? 'bg-[#D4AF37] text-black shadow-md'
                                                        : 'text-neutral-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/5 hover:text-[#D4AF37]'
                                                }`}
                                            >
                                                {category === 'All' ? 'All Articles' : category}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* CENTER: Intel Articles Grid */}
                        <div className="lg:col-span-6 w-full">
                            {/* Mobile Categories (Horizontal Scroll) */}
                            <div className="lg:hidden mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex gap-2">
                                    {['All', ...safeCategories].map((category) => {
                                        const isActive = selectedCategory === category;
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-extrabold transition-colors ${
                                                    isActive
                                                        ? 'bg-[#D4AF37] text-black shadow-sm'
                                                        : 'bg-white text-neutral-700 border border-slate-200 dark:bg-card-dark dark:text-neutral-300 dark:border-white/10'
                                                }`}
                                            >
                                                {category === 'All' ? 'All' : category}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredPosts.map((post) => (
                                    <PostSummaryCard key={post.id} post={post} />
                                ))}
                            </div>

                            {filteredPosts.length === 0 && (
                                <div className="text-center mt-10 p-12 bg-white dark:bg-card-dark rounded-2xl border border-dashed border-slate-300 dark:border-white/15">
                                    <p className="text-neutral-600 dark:text-neutral-400">No articles found for this category.</p>
                                    <button
                                        onClick={() => setSelectedCategory('All')}
                                        className="mt-4 text-sm font-bold text-[#D4AF37] hover:text-[#ffe088] transition-colors"
                                    >
                                        View all articles &rarr;
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Stationary Sticky App Sidebar */}
                        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-hide">
                            <AppSidebar />
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const posts = await getPostSummaries();
    const categories = await getAllCategories();

    return {
        props: {
            posts,
            categories,
        },
        revalidate: 60,
    };
};
