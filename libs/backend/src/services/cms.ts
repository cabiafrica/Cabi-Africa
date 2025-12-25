import { BlogPost, BlogPostSummary } from '../../../../apps/user-portal/src/pages/[...slug]';

const CMS_URL = process.env.CMS_API_URL;
const CMS_TOKEN = process.env.CMS_API_TOKEN;

if (!CMS_URL || !CMS_TOKEN) {
  throw new Error('CMS_API_URL and CMS_API_TOKEN must be defined in environment variables.');
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

export async function getPostSummaries(): Promise<BlogPostSummary[]> {
  const response = await fetchFromCMS('posts');
  if (!response || !response.data) return [];
  return response.data.map(mapToPostSummary);
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const response = await fetchFromCMS(`posts/${id}`);
  if (!response || !response.data) return null;
  return mapToPost(response.data);
}