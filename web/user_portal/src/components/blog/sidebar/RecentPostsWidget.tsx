import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPostSummary } from '@/backend/services/cms';

interface RecentPostsWidgetProps {
    posts: BlogPostSummary[];
}

export default function RecentPostsWidget({ posts }: RecentPostsWidgetProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!posts || posts.length === 0) return null;

    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-[#D4AF37]">Recent Articles</h3>
            <div className="space-y-4">
                {posts.slice(0, 4).map((post) => (
                    <Link key={post.id} href={`/blog/${post.id}`} className="group flex gap-3 items-start">
                        {post.imageUrl && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-dark border border-white/10">
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                            </div>
                        )}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] line-clamp-2 text-sm leading-snug transition-colors">
                                {post.title}
                            </h4>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block">
                                {mounted && new Date(post.publishedDate).toLocaleDateString()}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
