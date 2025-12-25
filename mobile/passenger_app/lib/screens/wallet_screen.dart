import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/providers.dart';
import 'package:core_ui/core_ui.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  late Future<Map<String, dynamic>> _walletFuture;

  @override
  void initState() {
    super.initState();
    _walletFuture = ref.read(rideServiceProvider).getWalletDetails();
  }

  Future<void> _showCashOutDialog(double balance) async {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirm Payout'),
          content: Text(
            'Are you sure you want to cash out KES ${balance.toStringAsFixed(2)}?',
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: const Text('Confirm'),
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Payout initiated!')),
                );
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Wallet')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _walletFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final walletData = snapshot.data;
          if (walletData == null) {
            return const Center(child: Text('Could not load wallet details.'));
          }

          final balance = walletData['balance'] as double;
          final transactions = walletData['transactions'] as List;
          final payoutMethod = walletData['payoutMethod'] as Map;

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // Balance Card
              Card(
                color: Theme.of(context).primaryColor,
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      const Text(
                        'Current Balance',
                        style: TextStyle(color: Colors.white, fontSize: 18),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'KES ${balance.toStringAsFixed(2)}',
                        style:
                            Theme.of(context).textTheme.displayMedium?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      const SizedBox(height: 24),
                      PrimaryButton(
                        onPressed: () => _showCashOutDialog(balance),
                        label: 'Cash Out',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Payout Method
              Text(
                'Payout Method',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.account_balance),
                  title: Text(payoutMethod['bankName']),
                  subtitle: Text(payoutMethod['accountNumber']),
                  trailing: const Icon(Icons.edit),
                  onTap: () {
                    // Navigate to edit payout method screen in a future story
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Recent Transactions
              Text(
                'Recent Payouts',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              ...transactions.map((tx) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const Icon(Icons.history),
                    title: Text(
                      '${tx['type']} of KES ${tx['amount'].toStringAsFixed(2)}',
                    ),
                    subtitle: Text('On ${tx['date']}'),
                  ),
                );
              }).toList(),
            ],
          );
        },
      ),
    );
  }
}
