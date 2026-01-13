import { GetStaticProps } from 'next';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import PostSummaryCard from '../../components/PostSummaryCard';
import AppSidebar from '../../components/blog/sidebar/AppSidebar';
import { getPostSummaries, getAllCategories, BlogPostSummary } from '@/backend/services/cms';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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

    const filteredPosts = selectedCategory === 'All'
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    return (
        <MainLayout title="Intel - Cabi" description="Latest news, updates, and stories from the Cabi community.">
            <div className="bg-gray-50 dark:bg-slate-900 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1600px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* LEFT: Categories Sidebar (Using existing logic but moved to sidebar) */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-24">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Categories</h3>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setSelectedCategory('All')}
                                            className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'All'
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            All Posts
                                        </button>
                                        {categories.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CENTER: Blog Posts Grid */}
                        <div className="lg:col-span-6 w-full">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Latest Intel</h1>
                                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                                    Discover stories, news, and tips from Cabi.
                                </p>
                            </div>

                            {/* Mobile Categories (Horizontal Scroll) */}
                            <div className="lg:hidden mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedCategory('All')}
                                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'All'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-gray-700'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-gray-700'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredPosts.map((post) => (
                                    <PostSummaryCard key={post.id} post={post} />
                                ))}
                            </div>

                            {filteredPosts.length === 0 && (
                                <div className="text-center mt-20 p-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400">No posts found for this category.</p>
                                    <button
                                        onClick={() => setSelectedCategory('All')}
                                        className="mt-4 text-indigo-600 font-semibold hover:text-indigo-500"
                                    >
                                        View all posts
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: App Sidebar */}
                        <div className="lg:col-span-3">
                            <div className="sticky top-24 h-fit">
                                <AppSidebar />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
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
