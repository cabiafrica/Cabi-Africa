import 'package:flutter/material.dart';

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
    'Driving with Cabi',
    'Payments & Earnings',
    'Account & App',
    'Safety',
  ];

  final List<Map<String, dynamic>> _faqs = [
    {
      'category': 'Driving with Cabi',
      'question': 'What are the requirements to become a Cabi driver?',
      'answer': '''To become a Cabi driver, you must meet the following requirements:
• Be at least 21 years of age
• Hold a valid, in-state driver's license
• Have at least one year of licensed driving experience
• Have a valid vehicle registration and insurance
• Use an eligible 4-door vehicle
• Pass a background check''',
    },
    {
      'category': 'Driving with Cabi',
      'question': 'What kind of vehicle do I need?',
      'answer': 'Your vehicle must be a 4-door car, in good condition, and no more than 15 years old. Specific requirements may vary by city.',
    },
    {
      'category': 'Driving with Cabi',
      'question': 'How do I sign up?',
      'answer': 'You can start your application right here on our website! Fill out the initial form, and we\'ll guide you through downloading the Cabi Driver App to upload your documents.',
    },
    {
      'category': 'Payments & Earnings',
      'question': 'How much can I earn with Cabi?',
      'answer': 'Your earnings depend on when, where, and how often you drive. We offer competitive rates and numerous opportunities for bonuses.',
    },
    {
      'category': 'Payments & Earnings',
      'question': 'How do I get paid?',
      'answer': 'We offer flexible payment options. You can choose weekly direct deposit or use our Instant Payout feature to cash out your earnings at any time.',
    },
    {
      'category': 'Payments & Earnings',
      'question': 'Does Cabi take a commission?',
      'answer': 'Yes, Cabi takes a commission from the fare to cover platform costs. Our commission rates are transparent, and you\'ll see a detailed breakdown for every trip.',
    },
    {
      'category': 'Account & App',
      'question': 'How do I get the Cabi Driver App?',
      'answer': 'After completing the initial web registration, we\'ll provide a direct link to download the app from the Apple App Store or Google Play Store.',
    },
    {
      'category': 'Account & App',
      'question': 'I\'m having trouble with the app. Where can I get help?',
      'answer': 'We have a 24/7 support team ready to assist you. Contact support directly through the Cabi Driver App.',
    },
    {
      'category': 'Safety',
      'question': 'What safety features does Cabi provide?',
      'answer': 'Cabi includes GPS tracking, emergency SOS button, trip sharing with trusted contacts, and 24/7 safety support.',
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
                  onPressed: () {
                    // Navigate to support
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Contact'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
