import { GetStaticProps } from 'next';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import PostSummaryCard from '../../components/PostSummaryCard';
import { getPostSummaries, getAllCategories, BlogPostSummary } from '../../../backend/services/cms';
import { useState } from 'react';

interface BlogIndexProps {
    posts: BlogPostSummary[];
    categories: string[];
}

export default function BlogIndex({ posts, categories }: BlogIndexProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const filteredPosts = selectedCategory === 'All'
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    return (
        <MainLayout title="Blog - Cabi" description="Latest news, updates, and stories from the Cabi community.">
            <div className="bg-white dark:bg-slate-900 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">From the Blog</h2>
                        <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Discover stories, news, and tips from Cabi.
                        </p>
                    </div>

                    {/* Categories */}
                    <div className="mt-8 flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'All'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                                }`}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {filteredPosts.map((post) => (
                            <PostSummaryCard key={post.id} post={post} />
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="text-center mt-20">
                            <p className="text-gray-500 dark:text-gray-400">No posts found for this category.</p>
                        </div>
                    )}
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
