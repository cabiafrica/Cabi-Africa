export interface BlogPostSummary {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishedDate: string;
  category?: string;
  slug?: string;
}

export async function getAllCategories(): Promise<string[]> {
  return ['Technology', 'Lifestyle', 'Updates'];
}

export interface BlogPost extends BlogPostSummary {
  authorName: string;
  content: string;
  readTime?: string;
}

export const getAllPosts = getPostSummaries;
export const getPostBySlug = getPostById;

const CMS_URL = process.env.CMS_API_URL;
const CMS_TOKEN = process.env.CMS_API_TOKEN;
const USE_MOCK = !CMS_URL || !CMS_TOKEN;

if (USE_MOCK) {
  console.warn('CMS_API_URL or CMS_API_TOKEN not found. Using mock data.');
}

async function fetchFromCMS(path: string) {
  const url = `${CMS_URL}/api/${path}`;
  const headers = {
    Authorization: `Bearer ${CMS_TOKEN}`,
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    console.error(`Failed to fetch from CMS: ${response.statusText}`);
    // In a real app, you might want to throw an error or return a specific error object.
    return null;
  }

  return response.json();
}

// This function assumes a Strapi-like response structure.
function mapToPostSummary(entry: any): BlogPostSummary {
  return {
    id: entry.id.toString(),
    title: entry.attributes.title,
    summary: entry.attributes.summary,
    imageUrl: entry.attributes.imageUrl,
    publishedDate: entry.attributes.publishedAt,
  };
}

// This function assumes a Strapi-like response structure.
function mapToPost(entry: any): BlogPost {
  return {
    id: entry.id.toString(),
    title: entry.attributes.title,
    summary: entry.attributes.summary,
    imageUrl: entry.attributes.imageUrl,
    publishedDate: entry.attributes.publishedAt,
    authorName: entry.attributes.authorName,
    content: entry.attributes.content, // Assuming content is stored as markdown/html
  };
}

// Mock Data
const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Urban Mobility in Kenya',
    summary: 'How Cabi is transforming the way Nairobi moves with decentralized ride-hailing.',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070', // Driver/Car
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
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071', // Portrait
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
    imageUrl: 'https://images.unsplash.com/photo-1517154942693-0e311a2f607d?q=80&w=2070', // Safety/Tech
    publishedDate: new Date(Date.now() - 172800000).toISOString(),
    authorName: 'Product Team',
    content: '<p>Safety is our top priority...</p>',
    category: 'Updates',
    slug: 'safety-features-update',
    readTime: '2 min read'
  }
];

export async function getPostSummaries(): Promise<BlogPostSummary[]> {
  // Always return mock data for development stability
  return MOCK_POSTS;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  // Always return mock data for development stability
  return MOCK_POSTS.find(p => p.id === id || p.slug === id) || null;
}