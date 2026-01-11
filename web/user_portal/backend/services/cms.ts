import fs from 'fs';
import path from 'path';

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

const postsFilePath = path.join(process.cwd(), 'backend', 'data', 'posts.json');

async function getPostsData(): Promise<BlogPost[]> {
  try {
    const fileContents = await fs.promises.readFile(postsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading posts file:', error);
    return [];
  }
}

async function savePostsData(posts: BlogPost[]): Promise<void> {
  await fs.promises.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
}

/**
 * Returns a static array of blog post summaries.
 */
export async function getPostSummaries(): Promise<BlogPostSummary[]> {
  const posts = await getPostsData();
  return posts.map(({ content, ...summary }) => summary);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  return await getPostsData();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getPostsData();
  return posts.find(post => post.slug === slug) || null;
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getPostsData();
  const categories = new Set(posts.map(post => post.category));
  return Array.from(categories);
}

// New Editing Capabilities

export async function createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  const posts = await getPostsData();
  const newPost = { ...post, id: Date.now().toString() };
  posts.push(newPost);
  await savePostsData(posts);
  return newPost;
}

export async function updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  const posts = await getPostsData();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedPost = { ...posts[index], ...updates };
  posts[index] = updatedPost;
  await savePostsData(posts);
  return updatedPost;
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getPostsData();
  const filteredPosts = posts.filter(p => p.id !== id);
  if (filteredPosts.length === posts.length) return false;

  await savePostsData(filteredPosts);
  return true;
}
