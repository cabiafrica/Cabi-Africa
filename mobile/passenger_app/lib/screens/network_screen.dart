import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/user_service.dart';
import 'package:passenger_app/screens/blog_list_screen.dart';
import 'package:passenger_app/screens/feedback_screen.dart';

class NetworkScreen extends StatefulWidget {
  final UserService? userService;
  const NetworkScreen({super.key, this.userService});

  @override
  State<NetworkScreen> createState() => _NetworkScreenState();
}

class _NetworkScreenState extends State<NetworkScreen> {
  late final UserService _userService;
  Future<Map<String, dynamic>>? _networkFuture;

  @override
  void initState() {
    super.initState();
    _userService = widget.userService ?? UserService();
    _networkFuture = _userService.getNetworkData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Network & Earnings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.comment_bank_outlined),
            onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const FeedbackScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.article_outlined),
            onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const BlogListScreen())),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _networkFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('Could not load network data.'));
          }

          final response = snapshot.data!;
          if (response['status'] == 'LOCKED') {
            return _buildLockedDashboard();
          }

          final networkData = response['data'] as Map<String, dynamic>;
          final totalEarnings =
              (networkData['totalEarnings'] as num).toDouble();
          final transactions = networkData['recentTransactions'] as List;

          return _buildUnlockedDashboard(
              totalEarnings,
              networkData['tier1Count'],
              networkData['tier2Count'],
              transactions);
        },
      ),
    );
  }

  Widget _buildLockedDashboard() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock_outline, size: 80, color: Colors.grey.shade600),
            const SizedBox(height: 24),
            Text(
              'Pay the registration fee to unlock your earnings dashboard.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // In a real app, this would trigger the payment flow for the registration fee.
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Initiating payment...')),
                );
              },
              child: const Text('Pay Registration Fee Now'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUnlockedDashboard(
      double totalEarnings, int tier1, int tier2, List transactions) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        _buildTotalEarningsCard(totalEarnings),
        const SizedBox(height: 16),
        _buildNetworkStatsCard(tier1, tier2),
        const SizedBox(height: 24),
        Text('Recent Transactions',
            style: Theme.of(context).textTheme.titleLarge),
        const Divider(),
        if (transactions.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(child: Text('No recent transactions.')),
          )
        else
          ...transactions.map((tx) => _buildTransactionTile(tx)).toList(),
      ],
    );
  }

  Widget _buildTotalEarningsCard(double totalEarnings) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Text('Total Lifetime Earnings',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(
              'KES ${NumberFormat("#,##0.00").format(totalEarnings)}',
              style: Theme.of(context)
                  .textTheme
                  .displaySmall
                  ?.copyWith(color: Colors.green.shade700),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNetworkStatsCard(int tier1, int tier2) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            Column(
              children: [
                Text('$tier1',
                    style: Theme.of(context).textTheme.headlineMedium),
                const Text('Direct Referrals'),
              ],
            ),
            Column(
              children: [
                Text('$tier2',
                    style: Theme.of(context).textTheme.headlineMedium),
                const Text('Indirect Referrals'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionTile(Map<String, dynamic> tx) {
    final amount = (tx['amount'] as num).toDouble();
    final date = DateTime.parse(tx['date']);
    return ListTile(
      leading: const Icon(Icons.card_giftcard, color: Colors.green),
      title: const Text('Commission Earned'),
      subtitle: Text(DateFormat.yMMMd().add_jm().format(date)),
      trailing: Text(
        '+ KES ${NumberFormat("#,##0.00").format(amount)}',
        style:
            const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
      ),
    );
  }
}
