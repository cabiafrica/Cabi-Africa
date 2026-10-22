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
        'title': 'Tax Guide for Independent Contractors',
        'readTime': '5 min read',
        'category': 'Finance & Compliance',
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

3. SACCO Benefits & Withholding:
If you are registered through an affiliated SACCO, your capital contributions and dividend shares enjoy preferential tax treatment under Kenyan SACCO regulations.
        ''',
      },
      {
        'title': 'Vehicle Maintenance Checklist',
        'readTime': '3 min read',
        'category': 'Vehicle Care',
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
