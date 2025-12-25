// Mock CMS service for the user‑portal project
// This file provides a minimal implementation of the `getPostSummaries` function
// referenced in `src/pages/index.tsx`. It returns a static list of blog post
// summaries so the page can render without requiring a real backend.

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  date: string; // ISO string
  content: string; // Markdown or HTML content
  category: string;
  author: string;
  coverImage?: string;
  readTime: string;
}

export type BlogPostSummary = Pick<BlogPost, 'id' | 'title' | 'excerpt' | 'slug' | 'date' | 'category' | 'coverImage' | 'readTime'>;

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Welcome to the New Cabi Experience',
    excerpt: 'We are thrilled to announce the launch of our new platform designed to make your rides smoother and more reliable.',
    slug: 'welcome-to-cabi',
    date: '2025-12-01T10:00:00Z',
    category: 'Updates',
    author: 'Cabi Team',
    readTime: '3 min read',
    content: `
      <h2>A New Era for Ride-Hailing</h2>
      <p>At Cabi, we've always believed that getting from point A to point B should be effortless. Today, we're taking a giant leap forward with the launch of our reimagined platform.</p>
      <p>We've listened to your feedback—both drivers and passengers—and built a system that prioritizes fairness, safety, and ease of use.</p>
      <h3>What's New?</h3>
      <ul>
        <li><strong>Fairer Driver Earnings:</strong> We've lowered our commission rates to ensure drivers take home more.</li>
        <li><strong>Enhanced Safety Features:</strong> Real-time tracking, emergency assistance, and vetted drivers.</li>
        <li><strong>Seamless Web Booking:</strong> No app? No problem. Book directly from our website.</li>
      </ul>
      <p>Join us on this journey as we redefine urban mobility.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '2',
    title: '5 Tips for earning more as a Cabi Driver',
    excerpt: 'Maximize your earnings with these insider tips on peak hours, hotspots, and customer service.',
    slug: '5-tips-earning-more-driver',
    date: '2025-12-05T14:30:00Z',
    category: 'Driver Tips',
    author: 'Sarah Johnson',
    readTime: '5 min read',
    content: `
      <h2>Maximize Your Income</h2>
      <p>Driving with Cabi offers flexibility, but did you know a few strategic moves can significantly boost your earnings? Here are our top tips.</p>
      <h3>1. Know the Peak Hours</h3>
      <p>Morning and evening rush hours are gold mines. Plan your shifts around 7-9 AM and 5-7 PM to catch the highest demand.</p>
      <h3>2. Positioning is Key</h3>
      <p>Don't just drive aimlessly. Wait near business districts, transit hubs, and popular entertainment venues.</p>
      <h3>3. Five-Star Service</h3>
      <p>A clean car and a friendly greeting go a long way. Higher ratings often lead to priority dispatching and tips.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Community Stories: Meeting Needs in the City',
    excerpt: 'How one driver went above and beyond to help a passenger in need.',
    slug: 'community-stories-meeting-needs',
    date: '2025-12-10T09:15:00Z',
    category: 'Community',
    author: 'David Chen',
    readTime: '4 min read',
    content: `
      <h2>More Than Just a Ride</h2>
      <p>Last week, we received a heartwarming email from a passenger named Elena. She shared a story about her driver, Michael, who didn't just drive her to the hospital but ensured she felt safe and calm during a stressful time.</p>
      <p>"It wasn't just a ride; it was human kindness when I needed it most," Elena wrote.</p>
      <p>At Cabi, we are proud of our community of drivers who bring empathy and care to their work every day.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Safety First: Our Commitment to You',
    excerpt: 'Learn about the new safety features we have implemented to keep you safe on every trip.',
    slug: 'safety-first-commitment',
    date: '2025-12-12T11:00:00Z',
    category: 'Updates',
    author: 'Cabi Safety Team',
    readTime: '3 min read',
    content: `
      <h2>Your Safety is Our Priority</h2>
      <p>We believe that every journey should be safe. That's why we've introduced a suite of new safety features.</p>
      <h3>New Features</h3>
      <ul>
        <li><strong>Ride Check:</strong> We monitor trips for unusual stops or route deviations.</li>
        <li><strong>Trusted Contacts:</strong> Share your trip details with loved ones instantly.</li>
        <li><strong>24/7 Support:</strong> Our support team is always just a tap away.</li>
      </ul>
    `,
    coverImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?q=80&w=2070&auto=format&fit=crop',
  }
];

/**
 * Returns a static array of blog post summaries.
 * In a real application this would fetch data from a headless CMS or API.
 */
export async function getPostSummaries(): Promise<BlogPostSummary[]> {
  // Simulated delay
  await new Promise((resolve) => setTimeout(resolve, 50));
  return MOCK_POSTS.map(({ content, ...summary }) => summary);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return MOCK_POSTS;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return MOCK_POSTS.find(post => post.slug === slug) || null;
}

export async function getAllCategories(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const categories = new Set(MOCK_POSTS.map(post => post.category));
  return Array.from(categories);
}
