import 'package:flutter/material.dart';

class LearningCenterScreen extends StatefulWidget {
  const LearningCenterScreen({super.key});

  @override
  State<LearningCenterScreen> createState() => _LearningCenterScreenState();
}

class _LearningCenterScreenState extends State<LearningCenterScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learning Center'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'VIDEOS'),
            Tab(text: 'ARTICLES'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildVideoList(),
          _buildArticleList(),
        ],
      ),
    );
  }

  Widget _buildVideoList() {
    final videos = [
      {'title': '5 Tips for 5-Star Ratings', 'duration': '3:45'},
      {'title': 'How to Maximize Earnings', 'duration': '5:20'},
      {'title': 'Safety First: Driving at Night', 'duration': '4:10'},
      {'title': 'Understanding Surge Pricing', 'duration': '2:55'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: videos.length,
      itemBuilder: (ctx, index) {
        final video = videos[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                height: 150,
                color: Colors.black87,
                child: const Center(
                  child: Icon(Icons.play_circle_fill, color: Colors.white, size: 50),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                        Text(video['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(video['duration']!, style: const TextStyle(color: Colors.grey)),
                    ]
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildArticleList() {
    final articles = [
      {
        'title': 'The Road to Dignity: Why Drivers and Commuters Across Africa Believe in Cabi',
        'readTime': '3 min read',
        'category': 'Community',
        'image': 'assets/images/driver-economic-growth.jpg',
        'content': '''
Anyone who has sat behind the wheel in Nairobi, Mombasa, Kampala, or Lagos knows the honest, exhausting reality of the road: fourteen hours in gridlock, unpredictable fuel prices, and apps that take oppressive commissions before you have even paid for lunch, let alone your vehicle lease.

A Fairer Model Built on African Soil:
Cabi was engineered right here, in partnership with driver cooperatives, fleet owners, and wealth creation partners who asked a simple question: What if the platform worked for the driver, instead of the driver working for the platform?

Instead of draining daily revenue through oppressive commissions, Cabi introduces an ethical reusable commission model. In as much as a commission is charged, it is reusable—channeled directly into driver wealth creation, healthcare pools, and vehicle asset savings, rather than corporate extraction. Every shilling earned hits the driver's mobile money or bank wallet automatically.

Three Tangible Benefits Changing Lives:
• Pathways to Vehicle Ownership: Through integrated wealth creation financing, every completed ride builds verified financial history, helping drivers transition from endless vehicle rentals to owning their own cars.
• Genuine Welfare & Healthcare Safety Nets: Automated opt-in welfare programs provide emergency health cover, tire and maintenance discounts, and peer support.
• Two-Way Safety & Dignity: Verified rider identities, mandatory 4-digit start PINs, and real human support protect drivers from arbitrary account lockouts.
        ''',
      },
      {
        'title': 'The Sacred Promise of Every Journey: Why Safety Belongs to Every Single One of Us',
        'readTime': '4 min read',
        'category': 'Safety & Trust',
        'image': 'assets/images/digital-trust-safety.jpg',
        'content': '''
Every single night across our bustling cities, thousands of quiet journeys take place. Behind every trip request is a precious, deeply personal human story. When you step behind the wheel or mount a boda, you are holding another human life in your hands. That trust is sacred.

Why Secure Usage of the App is Your Living Lifeline:
Technology can only protect you when you keep the safety shield active:

1. Never Accept the "Offline Deal" (Hapa Kando):
If an operator or rider suggests cancelling the trip or doing a cash deal outside the app, refuse immediately. The moment you cancel, the entire safety net collapses: live GPS tracking stops, automatic SOS alerts are severed, identities are decoupled, and insurance cover is voided. A few saved shillings are never worth your life.

2. The 4-Digit PIN is Your Unbreakable Lock:
Confirm the 4-digit start PIN before setting off. It provides absolute certainty that you and the passenger are the exact verified partners assigned to the journey.

3. Two-Way Protection:
Drivers face late-night uncertainty and vulnerable interactions on every shift. They are sons, mothers, and fathers who deserve to return home unharmed just as much as riders do. Cabi enforces verified passenger profiles and mutual accountability.
        ''',
      },
      {
        'title': 'The Power of Warmth: Why Everyday Courtesy and Tipping Turn Simple Rides into Shared Humanity',
        'readTime': '3 min read',
        'category': 'Community & Culture',
        'image': 'assets/images/kindness-courtesy-tipping.jpg',
        'content': '''
A vehicle or boda is never just metal, rubber, and an algorithm. For twenty minutes or an hour, it is a shared sanctuary. In that small space, two human beings journey together across the city.

The Real Hustle Behind the Steering Wheel:
It takes extraordinary resilience to drive professionally in Africa's major urban centers. Drivers are awake from 4:30 AM, maneuvering through unpredictable traffic and carrying family bills. They are doing rigorous work to uplift their households.

Doing Extra: Why Tipping is Warm-Hearted Solidarity:
On Cabi, 100% of every tip goes directly to the driver with 0% platform deductions. Every single shilling settles immediately into their mobile money or digital wallet.

Ubuntu teaches us: "I am because we are." When passengers and drivers treat each other with warmth, mutual dignity, and basic human courtesy, every street across Africa becomes safer.
        ''',
      },
      {
        'title': 'The Future of Urban Mobility in Kenya',
        'readTime': '5 min read',
        'category': 'Technology',
        'image': 'assets/images/future-urban-mobility.jpg',
        'content': '''
Urban transportation across major African metropolises is undergoing a profound digital transformation. In cities like Nairobi, Mombasa, and Kisumu, traditional transport ecosystems often grapple with unpredictable pricing, congested corridors, and oppressive commissions.

Empowering Drivers with Cooperative Technology:
Cabi ensures that fees charged are actively recycled into driver wealth creation, vehicle asset equity, and collective benefits, alongside predictable dynamic micro-pricing.

Electrification and Micro-Mobility:
With clean energy initiatives expanding across East Africa, Cabi is actively testing EV two-wheeler and three-wheeler fleet routing with battery swap stations strategically located around Nairobi's commercial nodes. This reduces daily fuel expenditures by up to 60% and slashes emissions across busy urban corridors.
        ''',
      },
      {
        'title': 'Tax Guide for Independent Contractors',
        'readTime': '5 min read',
        'category': 'Finance & Compliance',
        'image': 'assets/images/blog_1.png',
        'content': '''
As an independent driver on the Cabi platform in Kenya, understanding your tax obligations and business deductions helps you maximize your take-home earnings.

1. KRA e-TIMS & Turnover Tax (TOT)
Drivers operating as sole proprietors with gross turnover under KES 25 million qualify for simplified Turnover Tax or presumptive digital taxation. Keeping digital trip receipts within your Cabi Driver portal gives you an instant audit trail.

2. Legitimate Allowable Deductions:
• Fuel and charging expenditures
• Vehicle routine servicing and spare parts
• Car wash and sanitation costs
• Mobile data bundles used for dispatch navigation
• PSV insurance and inspection fees

3. Sacco Benefits & Withholding:
If you are registered through an affiliated Sacco, your capital contributions and dividend shares enjoy preferential tax treatment under Kenyan Sacco regulations.
        ''',
      },
      {
        'title': 'Vehicle Maintenance Checklist',
        'readTime': '3 min read',
        'category': 'Vehicle Care',
        'image': 'assets/images/blog_2.png',
        'content': '''
Routine preventive maintenance reduces unexpected breakdowns and ensures you qualify for Cabi's seasonal Vehicle Maintenance Benefit credits.

Daily Morning Checks:
• Tire pressure & tread depth (minimum 1.6mm legal limit)
• Windshield wiper fluid & clean mirrors
• Functional headlights, indicators, and brake lights
• Clean, odor-free passenger cabin

Weekly Inspection:
• Engine oil level and coolant reservoir
• Brake pad wear and responsive stopping distance
• Spare wheel condition, jack, and reflector triangles

Keeping your vehicle in top condition directly correlates with higher tips, repeat bookings, and 5-star passenger ratings.
        ''',
      },
      {
        'title': 'Providing Great Customer Service',
        'readTime': '4 min read',
        'category': 'Customer Experience',
        'image': 'assets/images/blog_3.png',
        'content': '''
Exceptional customer service is the quickest path to top-tier driver status and premium trip allocations on Cabi.

Key Practices for 5-Star Trips:
1. Warm Greeting: Confirm the passenger's name courteously before starting the trip.
2. Climate & Sound: Ask the rider if the vehicle temperature and radio station are comfortable.
3. Route Efficiency: Adhere to the in-app GPS route unless the passenger specifies an alternate preference.
4. Luggage Assistance: Offer a hand when riders have heavy bags or airport luggage.
5. Professional Silence: Read the room—some passengers prefer chatting while others need quiet focus.
        ''',
      },
      {
        'title': 'Community Guidelines & Safety Update',
        'readTime': '2 min read',
        'category': 'Safety & Policy',
        'image': 'assets/images/blog_1.png',
        'content': '''
Cabi maintains a zero-tolerance policy towards harassment, discrimination, or unsafe vehicle operation.

Crucial Guidelines:
• Mutual Respect: Treat every rider with dignity regardless of race, gender, or religion.
• No Offline Trips: Never solicit or accept off-app cash negotiations. Offline trips lose insurance coverage and emergency SOS support.
• Emergency Assistance: Familiarize yourself with the in-app SOS button and local dispatch hotline.
• Lost Property: Promptly report items left behind via the Driver Support tab. Returned items earn standard courier return compensation.
        ''',
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: articles.length,
      itemBuilder: (ctx, index) {
        final article = articles[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              backgroundColor: const Color(0xFFD4AF37).withValues(alpha: 0.1),
              child: const Icon(Icons.article_rounded, color: const Color(0xFFD4AF37)),
            ),
            title: Text(
              article['title']!,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Text(
                '${article['category']} • ${article['readTime']}',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
              ),
            ),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () => _showArticleDetail(context, article),
          ),
        );
      },
    );
  }

  void _showArticleDetail(BuildContext context, Map<String, String> article) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (sheetContext, scrollController) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: ListView(
            controller: scrollController,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  article['category'] ?? 'Article',
                  style: const TextStyle(
                    color: const Color(0xFFD4AF37),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                article['title']!,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                article['readTime'] ?? '',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
              ),
              const Divider(height: 32),
              Text(
                article['content']!.trim(),
                style: const TextStyle(fontSize: 15, height: 1.6),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4AF37),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Close Article', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
