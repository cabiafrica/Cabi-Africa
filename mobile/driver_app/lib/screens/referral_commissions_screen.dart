import 'package:flutter/material.dart';
import 'downline_screen.dart';

class ReferralCommissionsScreen extends StatefulWidget {
  const ReferralCommissionsScreen({super.key});

  @override
  State<ReferralCommissionsScreen> createState() =>
      _ReferralCommissionsScreenState();
}

class _ReferralCommissionsScreenState extends State<ReferralCommissionsScreen> {
  // Mock Data
  bool _isLoading = true;
  double _totalEarned = 0.0;
  List<Map<String, dynamic>> _history = [];

  @override
  void initState() {
    super.initState();
    _fetchCommissions();
  }

  Future<void> _fetchCommissions() async {
    // Simulate API call to GET /referral/my-commissions
    await Future.delayed(const Duration(seconds: 1));

    // Mock response
    setState(() {
      _totalEarned = 1500.00;
      _history = [
        {
          'id': 'tx-101',
          'amount': 500.0,
          'date': DateTime.now().subtract(const Duration(days: 1)),
          'description': 'Level 1 commission from new driver',
          'sourceDriverId': 'd-123'
        },
        {
          'id': 'tx-102',
          'amount': 500.0,
          'date': DateTime.now().subtract(const Duration(days: 3)),
          'description': 'Level 1 commission from new driver',
          'sourceDriverId': 'd-124'
        },
        {
          'id': 'tx-103',
          'amount': 250.0,
          'date': DateTime.now().subtract(const Duration(days: 5)),
          'description': 'Level 2 commission from referral chain',
          'sourceDriverId': 'd-125'
        },
        {
          'id': 'tx-104',
          'amount': 250.0,
          'date': DateTime.now().subtract(const Duration(days: 20)),
          'description': 'Level 2 commission from referral chain',
          'sourceDriverId': 'd-130'
        },
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Commissions'),
        actions: [
          TextButton(
            onPressed: () {
              // Navigation to Downline
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const DownlineScreen()));
            },
            child:
                const Text('MY NETWORK', style: TextStyle(color: Colors.white)),
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Summary Card
                Container(
                  width: double.infinity,
                  color: Colors.blue[800],
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Commission Earnings',
                          style:
                              TextStyle(color: Colors.white70, fontSize: 14)),
                      const SizedBox(height: 8),
                      Text('KES ${_totalEarned.toStringAsFixed(2)}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      const Text('Keep referring to earn more!',
                          style: TextStyle(
                              color: Colors.white60,
                              fontStyle: FontStyle.italic))
                    ],
                  ),
                ),

                // Transactions Header
                Container(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  alignment: Alignment.centerLeft,
                  child: const Text('Recent Commissions',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),

                // Transactions List
                Expanded(
                  child: _history.isEmpty
                      ? const Center(child: Text('No commissions yet.'))
                      : ListView.separated(
                          itemCount: _history.length,
                          separatorBuilder: (ctx, idx) =>
                              const Divider(height: 1),
                          itemBuilder: (ctx, index) {
                            final item = _history[index];
                            final date = item['date'] as DateTime;
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.green[100],
                                child: const Icon(Icons.people,
                                    color: Colors.green),
                              ),
                              title: Text(item['description']),
                              subtitle: Text(
                                  '${date.day}/${date.month}/${date.year} • Ref: ${item['sourceDriverId']}'),
                              trailing: Text(
                                  '${item['amount'] >= 0 ? '+' : ''}KES ${(item['amount'] as double).toStringAsFixed(2)}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green)),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
