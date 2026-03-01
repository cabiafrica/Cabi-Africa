import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/providers.dart';
import 'payout_setup_screen.dart';
import 'referral_screen.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  late Future<Map<String, dynamic>> _walletFuture;
  double _referralEarned = 0.0;
  bool _isLoadingReferral = true;
  final PassengerReferralService _referralService = PassengerReferralService();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() {
    _walletFuture = ref.read(rideServiceProvider).getWalletDetails();
    _fetchReferralCredits();
  }

  Future<void> _fetchReferralCredits() async {
    final authState = ref.read(passengerAuthProvider);
    String? userId;
    if (authState is Authenticated) {
      userId = authState.userId;
    }

    if (userId == null) {
      setState(() => _isLoadingReferral = false);
      return;
    }

    try {
      final data = await _referralService.getReferralHistory(userId);
      if (mounted) {
        setState(() {
          _referralEarned =
              double.tryParse(data['totalEarned']?.toString() ?? '0.0') ?? 0.0;
          _isLoadingReferral = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingReferral = false);
      }
    }
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

  Future<void> _showTopUpDialog() async {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Top Up Wallet'),
          content: const Text('Add funds via M-Pesa or Card.'),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: const Text('Proceed'),
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Payment Gateway Launched')),
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
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('My Wallet'),
        elevation: 0,
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
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

          return RefreshIndicator(
            onRefresh: () async => _fetchData(),
            child: ListView(
              padding: const EdgeInsets.all(20.0),
              children: [
                // Premium Balance Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'AVAILABLE BALANCE',
                        style: TextStyle(
                            color: Colors.white54,
                            letterSpacing: 1.2,
                            fontSize: 12),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'KES ${balance.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Color(0xFFFFD700),
                          fontSize: 40,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _showTopUpDialog,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFFD700),
                                foregroundColor: Colors.black,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('TOP UP',
                                  style:
                                      TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _showCashOutDialog(balance),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: Colors.white24),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('WITHDRAW'),
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Referral Card
                InkWell(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ReferralScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.purple.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.card_giftcard,
                              color: Colors.purple),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Referral Rewards',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              Text(
                                _isLoadingReferral
                                    ? 'Loading rewards...'
                                    : 'Earned KES ${_referralEarned.toStringAsFixed(0)}',
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios,
                            size: 14, color: Colors.grey),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Payout Method Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'PAYOUT METHOD',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.grey,
                          fontSize: 12,
                          letterSpacing: 1.1),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const PayoutSetupScreen()));
                      },
                      child:
                          const Text('Manage', style: TextStyle(fontSize: 12)),
                    )
                  ],
                ),
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.account_balance,
                        color: Colors.black87),
                    title: Text(payoutMethod['bankName'],
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(payoutMethod['accountNumber']),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                ),

                const SizedBox(height: 32),

                // Recent Activities
                const Text(
                  'RECENT ACTIVITY',
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                      fontSize: 12,
                      letterSpacing: 1.1),
                ),
                const SizedBox(height: 12),
                ...transactions.map((tx) {
                  return Card(
                    elevation: 0,
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: Colors.grey.shade200),
                    ),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.grey[100],
                        child: const Icon(Icons.history,
                            color: Colors.black54, size: 18),
                      ),
                      title: Text(
                        '${tx['type']}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      subtitle: Text('${tx['date']}',
                          style: const TextStyle(fontSize: 12)),
                      trailing: Text(
                        'KES ${tx['amount'].toStringAsFixed(0)}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  );
                }),

                const SizedBox(height: 30),
              ],
            ),
          );
        },
      ),
    );
  }
}
