import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class FAQScreen extends StatefulWidget {
  const FAQScreen({super.key});

  @override
  State<FAQScreen> createState() => _FAQScreenState();
}

class _FAQScreenState extends State<FAQScreen> {
  String _selectedCategory = 'All';
  int? _expandedIndex;

  final List<String> _categories = [
    'All',
    'Booking & Pricing',
    'Safety & Support',
    'Referral Incentive',
    'Driving with Cabi',
    'Earnings & Payouts',
  ];

  final List<Map<String, dynamic>> _faqs = [
    // Passenger Booking & Pricing
    {
      'category': 'Booking & Pricing',
      'question': 'How do I book a ride with Cabi?',
      'answer': 'You can book a trip either through the Cabi Passenger app or directly via our web-based booking portal. Simply choose from our available service options, enter your destination, and confirm your pickup to receive an upfront fare estimate and connect with your driver.',
    },
    {
      'category': 'Booking & Pricing',
      'question': 'What payment methods are accepted?',
      'answer': 'We accept Mobile Money, major debit and credit cards, cash, and corporate travel billing. All fares are calculated and presented upfront with transparent pricing.',
    },
    {
      'category': 'Booking & Pricing',
      'question': 'How is the fare calculated?',
      'answer': 'Fares are calculated based on a base rate, distance, and trip duration, presented upfront before confirming your ride. If you need to alter your destination or take an alternate route during the trip, changing the route must be a mutual agreement between you and your driver. The final fare will adjust transparently to reflect the updated distance and travel time.',
    },
    {
      'category': 'Booking & Pricing',
      'question': 'What should I do if I leave an item in a vehicle?',
      'answer': 'If you leave an item behind, go to your Trip History in the Cabi app and select the relevant ride to contact your driver directly. You can also reach out to Cabi Customer Support, and our team will help coordinate the safe recovery and return of your property.',
    },

    // Safety & Support
    {
      'category': 'Safety & Support',
      'question': 'How does Cabi ensure safety for both drivers and passengers?',
      'answer': 'Safety is mutual and vital for everyone. To keep our shared community safe and accountable, both drivers and passengers undergo user verification. Every trip is further protected by real-time GPS tracking, an in-app emergency alert button, and mutual two-way ratings.',
    },
    {
      'category': 'Safety & Support',
      'question': 'How do I contact Cabi Customer Support?',
      'answer': 'You can contact Cabi support 24/7 through in-app live chat, email at cabifastafrica@gmail.com, or our customer hotline at 0758 777 222 (+254 758 777 222).',
    },

    // Referral Incentive Program
    {
      'category': 'Referral Incentive Program',
      'question': 'Does Cabi have a referral incentive?',
      'answer': 'Yes. As a gesture of appreciation for helping spread the word about Cabi, we offer a referral incentive for community members who introduce new drivers and passengers. Drivers can refer fellow drivers only, while passengers can refer both passengers and drivers. For qualification criteria and operational guidelines, please review our official Referral Program Policy.',
    },
    {
      'category': 'Referral Incentive Program',
      'question': 'Where do I find my referral code?',
      'answer': 'You can find your unique referral link directly in the Cabi app under your profile or menu. Please review our Referral Terms & Conditions to see the full details on how rewards are earned and credited.',
    },

    // Driving with Cabi & Onboarding
    {
      'category': 'Driving with Cabi',
      'question': 'How do I become a Cabi driver partner?',
      'answer': 'To become a Cabi driver partner, fill out our quick registration form with your personal details and referral code (if someone invited you). Download the Cabi Driver app and upload your credentials. Once digitally verified, your account will be activated and ready to go online.',
    },
    {
      'category': 'Driving with Cabi',
      'question': 'Is there a registration fee to become a driver?',
      'answer': 'Cabi driver registration is completely free. There are no fees to join or activate your account, unless you voluntarily choose to enroll in a specialized program.',
    },
    {
      'category': 'Driving with Cabi',
      'question': 'What are the vehicle and document requirements to drive with Cabi?',
      'answer': 'To drive with Cabi, you must be at least 21 years old, hold a valid driver\'s license with an official NTSA badge, and comply with statutory NTSA guidelines. Your vehicle must be clean, well-maintained, and roadworthy with valid PSV insurance cover. Drivers must upload their credentials and successfully pass our digital qualifications.',
    },
    {
      'category': 'Driving with Cabi',
      'question': 'How will I know when my account is verified and approved?',
      'answer': 'Once you submit your credentials, our verification team reviews your profile. You will receive notifications via SMS, in-app, or email alerts confirming your approval and activating your account to start driving.',
    },
    {
      'category': 'Driving with Cabi',
      'question': 'Can I choose when and where to drive?',
      'answer': 'Yes. Cabi offers complete schedule flexibility—you can drive full-time, part-time, or whenever convenient, with no mandatory shifts. You can operate in any active Cabi coverage area, provided your vehicle complies with the local county transport bylaws and parking permits of that operational zone.',
    },
    {
      'category': 'Driving with Cabi',
      'question': 'How do I accept ride requests?',
      'answer': 'When you are online in the Cabi Driver app, you will receive nearby ride requests with transparent upfront details: pickup location, destination, estimated fare, and passenger rating. You have ample time to accept or pass.',
    },

    // Earnings & Payouts
    {
      'category': 'Earnings & Payouts',
      'question': 'How much can I earn as a Cabi driver partner?',
      'answer': 'How much you earn depends on your personal effort and resilience. Cabi provides different earning programs that a driver can voluntarily join to make their commissions reusable and significantly more valuable, building long-term financial growth and equity.',
    },
    {
      'category': 'Earnings & Payouts',
      'question': 'When and how do I receive my payouts?',
      'answer': 'Cabi provides instant payouts directly to your Mobile Money wallet or local Kenyan bank account with zero settlement delay. Cash fares are collected immediately by you during the ride, while cashless digital trips and corporate rides are settled directly into your wallet without holding periods.',
    },
    {
      'category': 'Earnings & Payouts',
      'question': 'How do I track my earnings?',
      'answer': 'The Cabi Driver app features a comprehensive earnings dashboard where you can view your real-time earnings per trip, daily and weekly totals, and tips. You can also monitor your active program balances and export your statements at any time.',
    },
  ];

  List<Map<String, dynamic>> get _filteredFAQs {
    if (_selectedCategory == 'All') return _faqs;
    return _faqs.where((faq) => faq['category'] == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FAQ'),
        backgroundColor: const Color(0xFFD4AF37),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Category Filter
          Container(
            height: 50,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                final isSelected = _selectedCategory == category;
                
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedCategory = category;
                      _expandedIndex = null;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFFD4AF37) : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Center(
                      child: Text(
                        category,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey.shade700,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          
          // FAQ List
          Expanded(
            child: _filteredFAQs.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.help_outline, size: 80, color: Colors.grey.shade400),
                        const SizedBox(height: 16),
                        Text(
                          'No FAQs in this category',
                          style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredFAQs.length,
                    itemBuilder: (context, index) {
                      final faq = _filteredFAQs[index];
                      final isExpanded = _expandedIndex == index;
                      
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          onTap: () {
                            setState(() {
                              _expandedIndex = isExpanded ? null : index;
                            });
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        faq['question'],
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    Icon(
                                      isExpanded
                                          ? Icons.expand_less
                                          : Icons.expand_more,
                                      color: const Color(0xFFD4AF37),
                                    ),
                                  ],
                                ),
                                if (isExpanded) ...[
                                  const SizedBox(height: 12),
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      faq['answer'],
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey.shade800,
                                        height: 1.5,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          
          // Contact Support
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              border: Border(top: BorderSide(color: Colors.blue.shade200)),
            ),
            child: Row(
              children: [
                Icon(Icons.support_agent, color: Colors.blue.shade700),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Still have questions?',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      Text(
                        'Contact our 24/7 support team',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final Uri launchUri = Uri(scheme: 'tel', path: '+254758777222');
                    if (await canLaunchUrl(launchUri)) {
                      await launchUrl(launchUri);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4AF37),
                    foregroundColor: Colors.black,
                    textStyle: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  child: const Text('Call Support'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
