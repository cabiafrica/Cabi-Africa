import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ReferralScreen extends StatefulWidget {
  const ReferralScreen({super.key});

  @override
  State<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends State<ReferralScreen> {
  final String _myReferralCode = 'REFUSER123'; // Mock - from API
  final List<Map<String, dynamic>> _referralHistory = [
    {'name': 'John Doe', 'email': 'john@example.com', 'status': 'COMPLETED', 'credit': 5.00, 'date': DateTime.now().subtract(const Duration(days: 5))},
    {'name': 'Jane Smith', 'email': 'jane@example.com', 'status': 'PENDING', 'credit': 5.00, 'date': DateTime.now().subtract(const Duration(days: 2))},
  ];

  void _shareReferralCode() {
    Clipboard.setData(ClipboardData(text: _myReferralCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Referral code copied to clipboard!')),
    );
    // In real app: Share.share('Use my code $_myReferralCode to get \$5 off your first ride!')
  }

  @override
  Widget build(BuildContext context) {
    final completedReferrals = _referralHistory.where((r) => r['status'] == 'COMPLETED').length;
    final totalEarned = completedReferrals * 5.00;

    return Scaffold(
      appBar: AppBar(title: const Text('Refer Friends')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Referral Code Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.purple, Colors.deepPurple],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(Icons.card_giftcard, color: Colors.white, size: 48),
                  const SizedBox(height: 16),
                  const Text(
                    'Give \$5, Get \$5',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Share your code with friends. When they take their first ride, you both get \$5!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white70),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        const Text('Your Referral Code', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 8),
                        Text(
                          _myReferralCode,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _shareReferralCode,
                    icon: const Icon(Icons.share),
                    label: const Text('SHARE CODE'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.purple,
                      minimumSize: const Size.fromHeight(50),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Stats Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStat('Successful Referrals', completedReferrals.toString()),
                    Container(width: 1, height: 40, color: Colors.grey[300]),
                    _buildStat('Total Earned', '\$${totalEarned.toStringAsFixed(2)}'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),
            const Text('Referral History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            // Referral History
            ..._referralHistory.map((referral) => Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: referral['status'] == 'COMPLETED' ? Colors.green[100] : Colors.orange[100],
                  child: Icon(
                    referral['status'] == 'COMPLETED' ? Icons.check : Icons.schedule,
                    color: referral['status'] == 'COMPLETED' ? Colors.green : Colors.orange,
                  ),
                ),
                title: Text(referral['email']),
                subtitle: Text(
                  referral['status'] == 'COMPLETED'
                      ? 'Completed • ${_formatDate(referral['date'])}'
                      : 'Pending signup',
                ),
                trailing: referral['status'] == 'COMPLETED'
                    ? Text(
                        '+\$${referral['credit'].toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      )
                    : null,
              ),
            )),

            if (_referralHistory.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Text(
                    'No referrals yet. Share your code to get started!',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
