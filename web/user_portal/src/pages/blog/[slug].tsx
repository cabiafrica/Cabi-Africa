import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/blog/sidebar/Sidebar';
import AppSidebar from '../../components/blog/sidebar/AppSidebar';
import { getPostBySlug, getAllPosts, getAllCategories, BlogPost, BlogPostSummary } from '@/backend/services/cms';

interface BlogPostPageProps {
    post: BlogPost;
    recentPosts: BlogPostSummary[];
    categories: string[];
}

export default function BlogPostPage({ post, recentPosts, categories }: BlogPostPageProps) {
    const router = useRouter();

    if (router.isFallback) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <MainLayout title={`${post.title} - Cabi Blog`} description={post.summary}>
            <Head>
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.summary} />
                {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
            </Head>

            <div className="bg-gray-50 dark:bg-slate-900 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1600px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* LEFT: Blog Sidebar (Hidden on mobile/tablet, shown on lg) */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-24 h-fit overflow-y-auto max-h-[calc(100vh-8rem)] pr-2 scrollbar-hide">
                                <Sidebar recentPosts={recentPosts} categories={categories} />
                            </div>
                        </div>

                        {/* CENTER: Main Content Area */}
                        <div className="lg:col-span-6 w-full">
                            <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 md:p-10 prose dark:prose-invert prose-lg max-w-none">
                                <Link href="/blog" className="no-underline text-sm font-semibold leading-7 text-indigo-600 hover:text-indigo-500 mb-6 inline-flex items-center gap-1">
                                    &larr; Back to Blog
                                </Link>

                                <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
                                    <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                                        {post.category || 'General'}
                                    </span>
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">{post.title}</h1>

                                    <div className="flex items-center gap-x-4">
                                        {/* Author avatar placeholder */}
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow-sm">
                                            {post.authorName?.charAt(0)}
                                        </div>
                                        <div className="text-sm leading-6">
                                            <p className="font-bold text-gray-900 dark:text-white m-0">
                                                {post.authorName}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400 m-0">
                                                {new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                {post.readTime && <> · <span className="text-gray-400">{post.readTime}</span></>}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {post.imageUrl && (
                                    <figure className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-10 not-prose bg-gray-100 dark:bg-slate-700">
                                        <Image
                                            src={post.imageUrl}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform hover:scale-105 duration-700"
                                            priority
                                        />
                                    </figure>
                                )}

                                <div className="prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400" dangerouslySetInnerHTML={{ __html: post.content }} />
                            </article>
                        </div>

                        {/* RIGHT: App Sidebar */}
                        <div className="lg:col-span-3">
                            <div className="sticky top-24 h-fit">
                                <AppSidebar />

                                {/* Mobile-only Blog Sidebar Items (stacked below app sidebar on mobile) */}
                                <div className="lg:hidden mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                                    <Sidebar recentPosts={recentPosts} categories={categories} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getAllPosts();
    // Assuming slug is optional in mock, fallback to ID if no slug.
    // In real app, make sure slug is always present.
    const paths = posts.map((post) => ({
        params: { slug: post.id }, // Using ID as slug for now based on previous decisions
    }));

    return {
        paths,
        fallback: true, // Enable fallback for dynamic/new posts
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const slug = params?.slug as string;
    const post = await getPostBySlug(slug);
    const recentPosts = await getAllPosts(); // Mock: fetch all as recent
    const categories = await getAllCategories();

    if (!post) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            post,
            recentPosts,
            categories,
        },
        revalidate: 60,
    };
};
