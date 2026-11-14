import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BlogPostSummary } from '@/backend/services/cms';

export default function PostSummaryCard({
    post,
}: {
    post: BlogPostSummary;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Link
            href={`/blog/${post.id}`}
            className="group relative flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 bg-white dark:bg-card-dark"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-surface-dark">
                <Image
                    src={post.imageUrl && !post.imageUrl.includes('unsplash.com') ? post.imageUrl : '/images/from-nairobi-to-world.jpg'}
                    alt={`${post.title} — CABI Africa urban mobility editorial photography`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                        {post.category || 'Article'}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {mounted && new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                    {post.title}
                </h3>

                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {post.summary}
                </p>

                <div className="flex items-center text-sm font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                    Read article <span className="ml-1">&rarr;</span>
                </div>
            </div>
        </Link>
    );
}
