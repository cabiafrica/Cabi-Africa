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
            <NewsletterWidget />
        </aside>
    );
}
