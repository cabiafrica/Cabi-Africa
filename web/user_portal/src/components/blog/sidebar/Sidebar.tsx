import { BlogPostSummary } from '@/backend/services/cms';
import RecentPostsWidget from './RecentPostsWidget';
import CategoriesWidget from './CategoriesWidget';
import NewsletterWidget from './NewsletterWidget';

interface SidebarProps {
    recentPosts: BlogPostSummary[];
    categories: string[];
}

export default function Sidebar({ recentPosts, categories }: SidebarProps) {
    return (
        <aside className="space-y-8">
            <RecentPostsWidget posts={recentPosts} />
            <CategoriesWidget categories={categories} />

            {/* Ad / CTA Widget */}
            <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <h4 className="font-bold text-gray-500 dark:text-gray-400 mb-2">Advertise Here</h4>
                <p className="text-sm text-gray-400">Reach the Cabi community.</p>
            </div>

            <NewsletterWidget />
        </aside>
    );
}
