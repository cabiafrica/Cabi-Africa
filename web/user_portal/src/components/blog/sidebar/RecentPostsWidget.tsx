import Link from 'next/link';
import { BlogPostSummary } from '@/backend/services/cms';

interface RecentPostsWidgetProps {
    posts: BlogPostSummary[];
}

export default function RecentPostsWidget({ posts }: RecentPostsWidgetProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Recent Posts</h3>
            <div className="space-y-4">
                {posts.slice(0, 4).map((post) => (
                    <Link key={post.id} href={`/blog/${post.id}`} className="group flex gap-3 items-start">
                        {post.imageUrl && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                {/* Ideally use Next Image here, but for widget simple img is ok or simplified Structure */}
                                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                        )}
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 text-sm leading-snug">
                                {post.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                {new Date(post.publishedDate).toLocaleDateString()}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
