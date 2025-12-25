import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
    // TODO: Replace with actual API call to backend
    const posts: BlogPost[] = [
        {
            id: '1',
            slug: 'welcome-to-cabi-blog',
            title: 'Welcome to the Cabi Blog',
            excerpt: 'We\'re excited to launch our official blog to keep you updated on the latest features, news, and stories from the Cabi community.',
            content: `
        <h2>A New Chapter for Cabi</h2>
        <p>We're thrilled to announce the launch of the official Cabi blog! This platform will serve as your go-to source for the latest updates, feature announcements, and stories from our vibrant community of drivers and passengers.</p>
        
        <h2>What to Expect</h2>
        <p>Our blog will cover a wide range of topics, including:</p>
        <ul>
          <li><strong>Product Updates:</strong> Be the first to know about new features and improvements to the Cabi platform</li>
          <li><strong>Driver Stories:</strong> Inspiring stories from our driver community</li>
          <li><strong>Tips & Tricks:</strong> Helpful guides to get the most out of Cabi</li>
          <li><strong>Company News:</strong> Important announcements and milestones</li>
          <li><strong>Industry Insights:</strong> Trends and developments in the ride-hailing industry</li>
        </ul>
        
        <h2>Join the Conversation</h2>
        <p>We believe in building a community, not just a platform. This blog is a space for dialogue, and we encourage you to share your thoughts, experiences, and feedback in the comments.</p>
        
        <p>Thank you for being part of the Cabi family. We're excited to share this journey with you!</p>
      `,
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
            content: `
        <h2>Empowering Driver Communities</h2>
        <p>Today, we're excited to introduce Driver Organizations - a powerful new feature that enables drivers to form, manage, and grow their own communities within the Cabi platform.</p>
        
        <h2>What are Driver Organizations?</h2>
        <p>Driver Organizations are formal groups that allow drivers to:</p>
        <ul>
          <li>Create and manage their own driver communities</li>
          <li>Coordinate activities and events</li>
          <li>Share knowledge and best practices</li>
          <li>Build stronger networks within the platform</li>
        </ul>
        
        <h2>Key Features</h2>
        <p>Driver Organizations come with a comprehensive set of tools:</p>
        <ul>
          <li><strong>Self-Service Portal:</strong> Manage your organization independently</li>
          <li><strong>Member Management:</strong> Invite, approve, and manage members</li>
          <li><strong>Activity Coordination:</strong> Plan and organize group activities</li>
          <li><strong>Governance Tools:</strong> Establish clear leadership and succession plans</li>
        </ul>
        
        <h2>Getting Started</h2>
        <p>Interested in creating or joining a Driver Organization? Visit the Organizations section in your driver app to get started!</p>
      `,
            author: 'Product Team',
            publishedAt: '2024-12-10T14:30:00Z',
            category: 'Features',
            tags: ['drivers', 'organizations', 'features'],
            imageUrl: '/images/blog/driver-orgs.jpg',
        },
    ];

    return posts.find(post => post.slug === slug) || null;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = await getBlogPost(params.slug);

    if (!post) {
        return {
            title: 'Post Not Found | Cabi Blog',
        };
    }

    return {
        title: `${post.title} | Cabi Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getBlogPost(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Featured Image */}
            <section className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-black py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li>
                                <Link href="/" className="hover:underline opacity-80">
                                    Home
                                </Link>
                            </li>
                            <li className="opacity-60">/</li>
                            <li>
                                <Link href="/blog" className="hover:underline opacity-80">
                                    Blog
                                </Link>
                            </li>
                            <li className="opacity-60">/</li>
                            <li className="font-semibold">{post.title}</li>
                        </ol>
                    </nav>

                    {/* Category Badge */}
                    <div className="mb-4">
                        <span className="inline-block px-4 py-2 text-sm font-semibold bg-black text-yellow-400 rounded-full">
                            {post.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex items-center space-x-6 text-lg opacity-90">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <article className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    {/* Featured Image Placeholder */}
                    {post.imageUrl && (
                        <div className="mb-8 -mx-8 md:-mx-12 -mt-8 md:-mt-12">
                            <div className="relative h-96 bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center rounded-t-2xl">
                                <svg className="w-24 h-24 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Post Content */}
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:my-6 prose-li:my-2"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-yellow-100 hover:text-yellow-800 transition-colors cursor-pointer"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Share Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Share This Post
                        </h3>
                        <div className="flex space-x-4">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                                <span>Twitter</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                <span>WhatsApp</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Back to Blog Link */}
                <div className="mt-12 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center space-x-2 text-yellow-600 font-semibold hover:text-yellow-700 transition-colors group"
                    >
                        <svg
                            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Blog</span>
                    </Link>
                </div>
            </article>

            {/* Related Posts Section */}
            <section className="bg-gray-100 py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Related Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Placeholder for related posts */}
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="h-40 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg mb-4 flex items-center justify-center">
                                <svg className="w-12 h-12 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg mb-2">More posts coming soon...</h3>
                            <p className="text-gray-600 text-sm">Stay tuned for more updates and stories from Cabi!</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
