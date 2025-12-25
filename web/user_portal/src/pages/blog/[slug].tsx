import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '../../components/layout/MainLayout';
import { getPostBySlug, getAllPosts, BlogPost } from '../../../backend/services/cms';

interface BlogPostPageProps {
    post: BlogPost;
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    return (
        <MainLayout title={`${post.title} - Cabi Blog`} description={post.excerpt}>
            <Head>
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                {post.coverImage && <meta property="og:image" content={post.coverImage} />}
            </Head>

            <div className="bg-white dark:bg-slate-900 py-16 px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700 dark:text-gray-300">
                    <Link href="/blog" className="text-base font-semibold leading-7 text-indigo-600 hover:text-indigo-500 mb-8 inline-block">
                        &larr; Back to Blog
                    </Link>

                    <p className="text-base font-semibold leading-7 text-indigo-600">{post.category}</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{post.title}</h1>

                    <div className="mt-6 flex items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 pb-8 mb-8">
                        <div className="text-sm leading-6">
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {post.author}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {post.readTime}
                            </p>
                        </div>
                    </div>

                    {post.coverImage && (
                        <div className="relative w-full h-96 mb-10 rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <div className="blog-content prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

                </div>
            </div>
        </MainLayout>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getAllPosts();
    const paths = posts.map((post) => ({
        params: { slug: post.slug },
    }));

    return {
        paths,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const post = await getPostBySlug(params?.slug as string);

    if (!post) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            post,
        },
        revalidate: 60,
    };
};
