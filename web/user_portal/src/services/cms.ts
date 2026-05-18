import apiClient from '@/lib/apiClient';

export interface BlogPostSummary {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishedDate: string;
  category?: string;
  slug?: string;
}

export interface BlogPost extends BlogPostSummary {
  authorName: string;
  content: string;
  readTime?: string;
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const res = await apiClient.get('/v1/cms/categories');
    return res.data;
  } catch (error) {
    return ['Technology', 'Lifestyle', 'Updates'];
  }
}

export async function getPostSummaries(): Promise<BlogPostSummary[]> {
  try {
    const res = await apiClient.get('/v1/blog/posts');
    const posts = res.data;
    
    if (!posts || posts.length === 0) return MOCK_POSTS;
    
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      summary: post.summary || post.content?.substring(0, 150) + '...',
      imageUrl: post.imageUrl || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070',
      publishedDate: post.publishedDate || post.createdAt,
      category: post.category,
      slug: post.slug || post.id
    }));
  } catch (error) {
    console.error('Failed to fetch posts, using mock data:', error);
    return MOCK_POSTS;
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  try {
    const res = await apiClient.get(`/v1/blog/posts/${id}`);
    const post = res.data;
    
    return {
      id: post.id,
      title: post.title,
      summary: post.summary || post.content?.substring(0, 150) + '...',
      imageUrl: post.imageUrl || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070',
      publishedDate: post.publishedDate || post.createdAt,
      authorName: post.authorName || 'Cabi Team',
      content: post.content,
      category: post.category,
      slug: post.slug || post.id,
      readTime: post.readTime || '5 min read'
    };
  } catch (error) {
    console.warn(`Post ${id} not found locally, checking mocks...`);
    return MOCK_POSTS.find(p => p.id === id || p.slug === id) || null;
  }
}

export const getAllPosts = getPostSummaries;
export const getPostBySlug = getPostById;

// Mock Data for Fallback
const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Urban Mobility in Kenya',
    summary: 'How Cabi is transforming the way Nairobi moves with decentralized ride-hailing.',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070',
    publishedDate: new Date().toISOString(),
    authorName: 'Cabi Team',
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
    category: 'Technology',
    slug: 'future-urban-mobility',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Driver Success Stories: Meet John',
    summary: 'From struggling to find passengers to owning his own fleet. John shares his journey.',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071',
    publishedDate: new Date(Date.now() - 86400000).toISOString(),
    authorName: 'Community Manager',
    content: '<p>John started driving with Cabi in 2024...</p>',
    category: 'Lifestyle',
    slug: 'driver-success-john',
    readTime: '3 min read'
  },
  {
    id: '3',
    title: 'New Safety Features Update',
    summary: 'We have introduced new SOS features and real-time tracking for peace of mind.',
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074',
    publishedDate: new Date(Date.now() - 172800000).toISOString(),
    authorName: 'Product Team',
    content: '<p>Safety is our top priority...</p>',
    category: 'Updates',
    slug: 'safety-features-update',
    readTime: '2 min read'
  }
];