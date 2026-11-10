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
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return ['Technology', 'Lifestyle', 'Updates'];
  } catch (error) {
    return ['Technology', 'Lifestyle', 'Updates'];
  }
}

export async function getPostSummaries(): Promise<BlogPostSummary[]> {
  try {
    const res = await apiClient.get('/v1/blog/posts');
    const posts = res.data;

    if (!Array.isArray(posts) || posts.length === 0) return MOCK_POSTS;

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
    return MOCK_POSTS;
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  try {
    const res = await apiClient.get(`/v1/blog/posts/${id}`);
    const post = res.data;
    if (!post || !post.id || !post.title) {
      return MOCK_POSTS.find(p => p.id === id || p.slug === id) || null;
    }

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
    summary: 'How Cabi is transforming the way Nairobi moves with decentralized ride-hailing, electric bodas, and fair driver revenue sharing.',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070',
    publishedDate: new Date().toISOString(),
    authorName: 'Cabi Operations Team',
    content: `
      <p class="lead text-lg text-slate-300 mb-6">Urban transportation across major African metropolises is undergoing a profound digital transformation. In cities like Nairobi, Mombasa, and Kisumu, traditional transport ecosystems often grapple with unpredictable pricing, congested corridors, and disproportionate commission deductions from drivers.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Empowering Drivers with Cooperative Technology</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">Cabi was engineered to break the cycle of extractive commission models. By establishing a decentralized ride dispatch infrastructure, Cabi allows drivers to retain up to 90% of trip fares while providing passengers with predictable, dynamic micro-pricing. The platform integrates SACCO-level group registration, ensuring that drivers build cooperative equity rather than just working as day-to-day gig laborers.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Electrification and Micro-Mobility</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">The next frontier for Kenya's mobility landscape is green transit. With clean energy initiatives expanding across East Africa, Cabi is actively testing EV two-wheeler and three-wheeler fleet routing with battery swap stations strategically located around Nairobi's commercial nodes. This reduces daily fuel expenditures by up to 60% and slashes emissions across busy urban corridors.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Safety and Identity Integration</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">Through real-time biometric and document checks, coupled with live telemetry sharing, passengers and operators can traverse the city with unmatched confidence. As Kenya continues to embrace smart city solutions, Cabi remains committed to pioneering equitable, sustainable mobility for every citizen.</p>
    `,
    category: 'Technology',
    slug: 'future-urban-mobility',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Driver Success Stories: Meet John',
    summary: 'From struggling to find consistent riders to managing a growing vehicle fleet: John shares his journey with Cabi.',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071',
    publishedDate: new Date(Date.now() - 86400000).toISOString(),
    authorName: 'Community Manager',
    content: `
      <p class="lead text-lg text-slate-300 mb-6">When John Kamau first joined the ride-hailing industry in 2021, he operated a leased sedan and spent 14 hours a day on Nairobi's ring roads just to break even after paying platform fees and fuel.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">The Turning Point with Cabi</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">"When I registered with Cabi in early 2024, the difference was immediate," John explains. "Rather than handing over 25% to 30% of each trip to an offshore platform, Cabi's localized commission and daily automated M-Pesa payouts allowed me to start saving on day one."</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">From Solo Driver to Fleet Manager</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">Utilizing Cabi's multi-driver shift features and SACCO credit partnerships, John was able to qualify for vehicle maintenance benefits and eventually acquire a second vehicle. Today, John employs two other drivers through the Cabi Fleet Manager Portal, managing their shifts and daily revenue transparently.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Advice for New Operators</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">"Take advantage of the platform's verification and safety features," John advises new drivers. "When riders see that you are identity-verified and maintain high vehicle standards, the trip requests and ratings follow naturally. Cabi isn't just an app; it's a vehicle for economic independence."</p>
    `,
    category: 'Lifestyle',
    slug: 'driver-success-john',
    readTime: '3 min read'
  },
  {
    id: '3',
    title: 'New Safety Features Update',
    summary: 'Introducing multi-channel SOS emergency response, trip PIN verification, and real-time biometric passenger verification.',
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074',
    publishedDate: new Date(Date.now() - 172800000).toISOString(),
    authorName: 'Safety & Product Team',
    content: `
      <p class="lead text-lg text-slate-300 mb-6">At Cabi, passenger and driver safety is not an afterthought—it is the foundational layer upon which our entire transportation network is built. We are pleased to announce our latest suite of safety features designed for complete peace of mind.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">1. One-Touch Emergency SOS Dispatch</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">Our updated mobile applications now include a dedicated SOS emergency button connected directly to local emergency response teams and 24/7 security monitoring centers. With a single tap, your live GPS coordinates, vehicle registration, and driver details are automatically dispatched to emergency responders and your designated trusted contacts.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">2. Mandatory 4-Digit Trip Verification PIN</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">To eliminate wrong-vehicle boarding incidents, every ride now requires a mutual 4-digit PIN exchange before a driver can initiate the trip. Passengers receive the PIN immediately upon driver arrival, ensuring that both parties confirm each other before wheels roll.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">3. Real-Time Telemetry and Route Deviation Alerts</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">Our backend dispatch service actively monitors active routes against live traffic and expected routes. If a significant unexplained detour or unexpected prolonged stop occurs, the app prompts both rider and driver with safety check-ins and offers instant escalation to customer support.</p>
    `,
    category: 'Updates',
    slug: 'safety-features-update',
    readTime: '2 min read'
  }
];