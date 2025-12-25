import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Blog | Cabi - Latest News & Updates',
    description: 'Stay updated with the latest news, features, and announcements from Cabi ride-hailing platform.',
};

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishedAt: string;
    category: string;
    tags: string[];
    imageUrl?: string;
}

// Mock data - In production, this would fetch from an API
const getBlogPosts = async (): Promise<BlogPost[]> => {
    // TODO: Replace with actual API call to backend
    return [
        {
            id: '1',
            slug: 'welcome-to-cabi-blog',
            title: 'Welcome to the Cabi Blog',
            excerpt: 'We\'re excited to launch our official blog to keep you updated on the latest features, news, and stories from the Cabi community.',
            content: 'Full content here...',
            author: 'Cabi Team',
            publishedAt: '2024-12-15T10:00:00Z',
            category: 'Announcements',
            tags: ['launch', 'news'],
            imageUrl: '/images/blog/welcome.jpg',
        },
        {
            id: '2',
            slug: 'introducing-driver-organizations',
            title: 'Introducing Driver Organizations',
            excerpt: 'Learn about our new feature that allows drivers to form and manage their own organizations on the platform.',
            content: 'Full content here...',
            author: 'Product Team',
            publishedAt: '2024-12-10T14:30:00Z',
            category: 'Features',
            tags: ['drivers', 'organizations', 'features'],
            imageUrl: '/images/blog/driver-orgs.jpg',
        },
    ];
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default async function BlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-black py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Cabi Blog</h1>
                    <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
                        Stay updated with the latest news, features, and stories from the Cabi community
                    </p>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="container mx-auto px-4 py-16 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            {/* Post Image */}
                            {post.imageUrl && (
                                <div className="relative h-48 bg-gray-200 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent group-hover:opacity-0 transition-opacity duration-300" />
                                    {/* Placeholder for image */}
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Post Content */}
                            <div className="p-6">
                                {/* Category Badge */}
                                <div className="mb-3">
                                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                                        {post.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-yellow-600 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h2>

                                {/* Excerpt */}
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span className="font-medium">{post.author}</span>
                                    <time dateTime={post.publishedAt}>
                                        {formatDate(post.publishedAt)}
                                    </time>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Read More Link */}
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center text-yellow-600 font-semibold hover:text-yellow-700 transition-colors group"
                                >
                                    Read More
                                    <svg
                                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Empty State */}
                {posts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-600">Check back soon for updates and announcements!</p>
                    </div>
                )}
            </section>

            {/* Newsletter CTA */}
            <section className="bg-gradient-to-br from-gray-900 to-black text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Never Miss an Update</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Subscribe to our newsletter to get the latest posts delivered to your inbox
                    </p>
                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                        <button
                            type="submit"
                            className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-500 transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
