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
      imageUrl: post.imageUrl && !post.imageUrl.includes('unsplash.com') ? post.imageUrl : '/images/blog/future-urban-mobility.jpg',
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
      imageUrl: post.imageUrl && !post.imageUrl.includes('unsplash.com') ? post.imageUrl : '/images/blog/future-urban-mobility.jpg',
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
    imageUrl: '/images/blog/future-urban-mobility.jpg',
    publishedDate: new Date().toISOString(),
    authorName: 'Cabi Operations Team',
    content: `
      <p class="lead text-lg text-slate-300 mb-6">Urban transportation across major African metropolises is undergoing a profound digital transformation. In cities like Nairobi, Mombasa, and Kisumu, traditional transport ecosystems often grapple with unpredictable pricing, congested corridors, and oppressive commissions deducted from drivers.</p>
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Empowering Drivers with Cooperative Technology</h3>
      <p class="text-slate-300 mb-4 leading-relaxed">Cabi was engineered to break the cycle of oppressive commissions. By introducing an ethical reusable commission model, Cabi ensures that fees charged are not for corporate enrichment, but are actively recycled into driver wealth creation, vehicle asset equity, and collective benefits, alongside predictable, dynamic micro-pricing for passengers.</p>
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
    title: 'The Road to Dignity: Why Drivers and Commuters Across Africa Believe in Cabi',
    summary: 'A candid look at the daily hustle on our roads—and how a reusable commission model, dedicated wealth creation savings, and mutual respect are turning daily miles into real hope and long-term asset ownership.',
    imageUrl: '/images/blog/driver-economic-growth.jpg',
    publishedDate: new Date(Date.now() - 86400000).toISOString(),
    authorName: 'Cabi Editorial Desk',
    content: `
      <p class="lead text-lg text-slate-700 dark:text-slate-200 mb-6 font-medium">Anyone who has sat behind the wheel in Nairobi, Mombasa, Kampala, or Lagos knows the honest, exhausting reality of the road: fourteen hours in gridlock, unpredictable fuel prices, and apps that take very high and oppressive commissions before you have even paid for lunch, let alone your vehicle lease. For years, the men and women who keep our cities breathing have shouldered the greatest risk for the smallest reward.</p>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">A Fairer Model Built on African Soil</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Cabi was not designed in a boardroom thousands of miles away. It was engineered right here, in partnership with driver cooperatives, fleet owners, and wealth creation partners who asked a simple question: <em>What if the platform worked for the driver, instead of the driver working for the platform?</em></p>
      
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Instead of draining daily revenue through oppressive commissions, Cabi introduces an ethical reusable commission model. In as much as a commission is charged, it is reusable—channeled directly into driver wealth creation, healthcare pools, and vehicle asset savings, rather than corporate extraction or personal enrichment. Every shilling earned hits the driver's mobile money or bank wallet instantly and automatically at the end of each shift. No delays. No opaque accounting. No guessing whether you will make rent at the end of the month.</p>

      <div class="my-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-white">
        <p class="text-base font-semibold italic mb-2">"For the first time in five years of driving, I am not just surviving day-to-day. My daily trips now contribute automatically to my driver wealth fund and vehicle maintenance savings. Cabi made me feel like a valued partner, not an invisible algorithm."</p>
        <span class="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">— Samuel M., Cabi Driver Partner & Wealth Creation Advocate, Nairobi</span>
      </div>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Three Tangible Benefits Changing Lives</h3>
      <ul class="space-y-3 text-slate-700 dark:text-slate-300 mb-6 list-none pl-0">
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs shrink-0 mt-0.5">✓</span>
          <span><strong>Pathways to Vehicle Ownership:</strong> Through integrated wealth creation financing, every completed ride builds verified financial history, helping drivers transition from endless vehicle rentals to owning their own cars.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs shrink-0 mt-0.5">✓</span>
          <span><strong>Genuine Welfare & Healthcare Safety Nets:</strong> Automated opt-in welfare programs provide emergency health cover, tire and maintenance discounts, and peer support when life happens.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs shrink-0 mt-0.5">✓</span>
          <span><strong>Two-Way Safety & Dignity:</strong> Verified rider identities, mandatory 4-digit start PINs, and real human support mean drivers are protected from hostile encounters and arbitrary account lockouts.</span>
        </li>
      </ul>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Why Everyone Wins—From Passengers to Global Observers</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">When a driver is financially secure and genuinely respected, the passenger experiences the difference immediately: vehicles are impeccably maintained, rides arrive faster, captains are patient and courteous, and fares remain honest without manipulative surge gouging.</p>

      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">To our community, passengers, and international partners watching Africa's mobility landscape: Cabi proves that economic fairness and commercial excellence are not opposites. By investing in human dignity on our roads, we build a safer, more reliable transit network that every African can take pride in.</p>

      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Ready to experience mobility built on trust and dignity? Whether you ride or drive, join the movement at <a href="/" class="text-amber-600 dark:text-brand-yellow underline hover:text-amber-500">cabi.africa</a>.</p>
      </div>
    `,
    category: 'Community',
    slug: 'the-road-to-dignity-why-drivers-choose-cabi',
    readTime: '3 min read'
  },
  {
    id: '3',
    title: 'The Sacred Promise of Every Journey: Why Safety Belongs to Every Single One of Us',
    summary: 'Safety is never just an app feature or a legal clause—it is the unspoken promise that you will return home to the people who love you. Here is why mutual protection and vigilant app usage matter on every street.',
    imageUrl: '/images/blog/digital-trust-safety.jpg',
    publishedDate: new Date(Date.now() - 172800000).toISOString(),
    authorName: 'Cabi Safety & Community Trust',
    content: `
      <p class="lead text-lg text-slate-700 dark:text-slate-200 mb-6 font-medium">Every single night across our bustling cities, thousands of quiet journeys take place. Behind every trip request is a precious, deeply personal human story: a mother returning home after a long evening shift to tuck her children into bed; a university student traveling back from late-night revision; a father working through midnight rain so his family has food on the table tomorrow; a doctor heading in to answer an urgent call. When you step into a vehicle or mount a boda, you are placing your life into another human being's hands. That trust is sacred.</p>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Safety is a Fundamental Human Right, Not a Luxury</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">We often talk about safety in technical terms—algorithms, GPS coordinates, and server logs. But true safety is profoundly human. It is the peace of mind a parent feels when their daughter sends a live trip link. It is the relief a driver feels knowing their passenger has been identity-verified. Safety is not a luxury tier or an optional extra; it is the non-negotiable foundation that allows our communities to work, learn, and thrive with dignity.</p>

      <div class="my-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-white">
        <p class="text-base font-semibold italic mb-2">"Safety is not just what the app does for you—it is the conscious covenant we make with each other every time we open the door. When we look out for one another, the entire city becomes our sanctuary."</p>
        <span class="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">— Cabi Safety Advisory Council</span>
      </div>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Why Secure Usage of the App is Your Living Lifeline</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Technology can only protect you when you keep the safety shield active. Across the mobility industry, the vast majority of avoidable incidents occur when someone accepts a casual, dangerous shortcut. Protecting your life requires three non-negotiable habits:</p>

      <ul class="space-y-4 text-slate-700 dark:text-slate-300 mb-6 list-none pl-0">
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 font-bold text-xs shrink-0 mt-0.5">✕</span>
          <span><strong>Never Accept the "Offline Deal" (Hapa Kando):</strong> If an operator or rider suggests cancelling the trip or doing a cash deal outside the app, refuse immediately. The moment you cancel, the entire safety net collapses: live GPS tracking stops, automatic SOS alerts are severed, driver and rider identities are decoupled, and insurance cover is voided. A few saved shillings are never worth your life.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs shrink-0 mt-0.5">✓</span>
          <span><strong>The 4-Digit PIN is Your Unbreakable Lock:</strong> Never open a car door without checking the license plate and confirming the 4-digit start PIN. It takes three seconds, but it provides absolute certainty that the vehicle and driver in front of you are the exact verified partners assigned to your journey.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs shrink-0 mt-0.5">✓</span>
          <span><strong>Guard Your Digital Keys:</strong> Your phone number, account password, and SMS one-time passcodes (OTPs) are personal safety keys. Never share verification codes with anyone, keep your emergency contacts updated in your profile, and report any suspicious behavior through the 24/7 help desk.</span>
        </li>
      </ul>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Two-Way Protection: Drivers Deserve Safety Too</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Safety is never a one-way street. Drivers face late-night uncertainty, dark alleys, and vulnerable interactions on every shift. They are sons, mothers, and fathers who deserve to return home unharmed just as much as riders do.</p>
      
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">By enforcing verified passenger profiles and mutual accountability, Cabi protects drivers from robbery, harassment, and groundless disputes. In turn, when passengers treat drivers with warmth, sobriety, and basic human courtesy, drivers are able to focus completely on what matters most: navigating traffic calmly and delivering you safely to your door.</p>

      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Before you take your next ride today, remember: someone is waiting for you at the other end of that road. Protect your journey. Use the app securely. Let's make every street across Africa safe, together.</p>
      </div>
    `,
    category: 'Safety & Trust',
    slug: 'the-sacred-promise-of-every-journey-safety-first',
    readTime: '4 min read'
  },
  {
    id: '4',
    title: 'The Power of Warmth: Why Everyday Courtesy and Tipping Turn Simple Rides into Shared Humanity',
    summary: 'A vehicle or boda is not merely four wheels and a motor—it is a shared human sanctuary. How a kind greeting, patience in traffic, and an intentional tip turn ordinary daily commutes into acts of mutual dignity and solidarity.',
    imageUrl: '/images/blog/kindness-courtesy-tipping.jpg',
    publishedDate: new Date(Date.now() - 259200000).toISOString(),
    authorName: 'Cabi Community Desk',
    content: `
      <p class="lead text-lg text-slate-700 dark:text-slate-200 mb-6 font-medium">In the relentless tempo of our growing cities—where morning mist hangs over Mombasa Road, rain slickens the pavements of Kisumu, and evening gridlock stretches patience thin—it is easy to forget what is truly happening when we travel. A vehicle or a boda is never just metal, rubber, and an algorithm. For twenty minutes or an hour, it is a shared sanctuary. In that small space, two human beings with entirely different stories, hopes, and worries journey together across the city.</p>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">The Real Hustle Behind the Steering Wheel</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">It takes extraordinary resilience to drive professionally in Africa's major urban centers. Before you tap your ride in the morning, your driver has likely been awake since 4:30 AM, maneuvering through unpredictable traffic, dodging deep potholes, enduring vehicle wear-and-tear, and carrying the silent weight of school fees, fuel price hikes, and family health bills. They are not automated delivery bots; they are fathers, mothers, and ambitious young professionals doing honest, rigorous work to uplift their households.</p>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Courtesy Costs Nothing, but It Changes Everything</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Kindness is not complicated. It begins the very second the car door opens:</p>

      <ul class="space-y-4 text-slate-700 dark:text-slate-300 mb-6 list-none pl-0">
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs shrink-0 mt-0.5">✦</span>
          <span><strong>A Warm Greeting (Habari Yako):</strong> A simple, sincere greeting acknowledges the person in front of you. It transforms an impersonal transaction into an encounter of equals.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs shrink-0 mt-0.5">✦</span>
          <span><strong>Closing the Door Gently:</strong> Treat the vehicle as someone's livelihood and office. A gentle close shows you respect the tool that brings them their daily bread.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs shrink-0 mt-0.5">✦</span>
          <span><strong>Patience in Traffic Snarls:</strong> Remember, gridlock frustrates the driver just as much as you. Calmness inside the cabin helps your captain stay focused, safe, and alert.</span>
        </li>
      </ul>

      <div class="my-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-white">
        <p class="text-base font-semibold italic mb-2">"Ubuntu teaches us: 'I am because we are.' When you step into a Cabi, you are sharing a piece of your day with someone who is working tirelessly to keep our city moving. A kind word and a warm gesture remind us that we are all on this road together."</p>
        <span class="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">— Grace W., Community Culture Lead, Cabi Africa</span>
      </div>

      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Doing Extra: Why Tipping is Warm-Hearted Solidarity</h3>
      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">In African culture, when someone goes out of their way to carry you safely through the rain, help with heavy bags, or navigate a difficult detour without complaint, we don't just say thank you—we extend a token of appreciation (<em>asante ya moyo</em>).</p>

      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Tipping on Cabi is not about societal pressure or obligation. It is about warm-hearted solidarity. On Cabi, <strong>100% of every tip goes directly to the driver with 0% platform deductions</strong>. Every single shilling settles immediately into their mobile money or digital wallet.</p>

      <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">A modest tip of KES 50, 100, or 200 may represent loose change on a coffee bill, but to a driver completing a grueling 12-hour shift, it pays for a hot evening meal between trips, buys fresh bread for their children on the way home, or contributes directly to their emergency wealth and asset savings fund without eating into fuel margins. Above all, it tells the driver: <em>"I see your hard work. I respect your effort. You made my day better."</em></p>

      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Next time you reach your destination, take five seconds: leave a kind word, offer a smile, and if you can, tap a tip in the app. Let's make kindness the heartbeat of every journey across Africa.</p>
      </div>
    `,
    category: 'Community & Culture',
    slug: 'the-power-of-warmth-courtesy-and-tipping',
    readTime: '3 min read'
  }
];
