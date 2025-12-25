// apps/user-portal/src/components/PostSummaryCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { BlogPostSummary } from '@/backend/services/cms';

export default function PostSummaryCard({
    post,
}: {
    post: BlogPostSummary;
}) {
    return (
        <Link href={`/posts/${post.id}`} className="group relative flex flex-col glass rounded-2xl overflow-hidden shadow-sm hover:shadow-brand-accent/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/5">
            <div className="relative aspect-video w-full overflow-hidden bg-brand-dark">
                {/* Generic Gradient Placeholder since we have no real images yet */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent to-brand-purple opacity-40 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-white/90 font-medium text-lg">
                    {post.title.substring(0, 1)}
                </div>
            </div>

            <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20">
                        Article
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-brand-yellow transition-colors">
                    {post.title}
                </h3>

                <p className="text-base text-gray-400 line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                </p>

                <div className="flex items-center text-sm font-medium text-brand-accent group-hover:translate-x-1 transition-transform">
                    Read article <span className="ml-1">→</span>
                </div>
            </div>
        </Link>
    );
}
