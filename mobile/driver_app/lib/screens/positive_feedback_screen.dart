import 'package:flutter/material.dart';

class PositiveFeedbackScreen extends StatelessWidget {
  const PositiveFeedbackScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Accolades'),
        centerTitle: true,
      ),
      body: FutureBuilder<Map<String, List<Map<String, dynamic>>>>(
        future: _fetchGroupedFeedback(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No feedback yet.'));
          }

          final groupedFeedback = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: groupedFeedback.length,
            itemBuilder: (context, index) {
              final monthKey = groupedFeedback.keys.elementAt(index);
              final items = groupedFeedback[monthKey]!;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    child: Text(
                      monthKey,
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.indigo),
                    ),
                  ),
                  ...items.map((item) => _buildFeedbackCard(item)),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Future<Map<String, List<Map<String, dynamic>>>>
      _fetchGroupedFeedback() async {
    // Mock Data grouped by Month
    await Future.delayed(const Duration(milliseconds: 800));
    return {
      'December 2025': [
        {
          'type': 'COMPLIMENT',
          'text': 'Great Conversation',
          'passenger': 'Jane W.',
          'date': 'Dec 24',
          'icon': Icons.chat_bubble_outline,
        },
        {
          'type': 'RATING',
          'text': '5-Star Rating',
          'passenger': 'Peter M.',
          'date': 'Dec 23',
          'comment': 'Very smooth ride, thanks!',
          'icon': Icons.star,
        },
      ],
      'November 2025': [
        {
          'type': 'COMPLIMENT',
          'text': 'Clean Car',
          'passenger': 'Alice K.',
          'date': 'Nov 15',
          'icon': Icons.cleaning_services,
        },
      ]
    };
  }

  Widget _buildFeedbackCard(Map<String, dynamic> item) {
    final isRating = item['type'] == 'RATING';
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isRating
                        ? Colors.amber.shade100
                        : const Color(0xFFD4AF37).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(item['icon'],
                      color: isRating ? Colors.amber.shade800 : const Color(0xFFD4AF37),
                      size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['text'],
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 2),
                      Text('${item['passenger']} • ${item['date']}',
                          style: TextStyle(
                              color: Colors.grey.shade600, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            if (item['comment'] != null) ...[
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8.0),
                child: Divider(),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.format_quote, color: Colors.grey, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                      child: Text(item['comment'],
                          style: const TextStyle(
                              fontStyle: FontStyle.italic,
                              color: Colors.black87))),
                ],
              )
            ]
          ],
        ),
      ),
    );
  }
}
