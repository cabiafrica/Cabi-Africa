import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'referral_commissions_screen.dart';
import 'sacco_screen.dart';
import 'payout_setup_screen.dart';
import '../widgets/earnings_goal_progress_card.dart';
import '../services/sacco_service.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  bool _isLoading = true;
  double _balance =
      154.50; // Main wallet balance (still mock until payment service is ready)
  double _saccoBalance = 0.0;
  double _referralBalance = 0.0;
  double _goal = 200.00;
  final double _currentEarnings = 154.50;

  final SaccoService _saccoService = SaccoService();
  final ReferralService _referralService = ReferralService();

  @override
  void initState() {
    super.initState();
    _fetchBalances();
  }

  Future<void> _fetchBalances() async {
    final authState = ref.read(authProvider);
    if (authState is! Authenticated) {
      setState(() => _isLoading = false);
      return;
    }

    final driverId = authState.userId;
    if (driverId == null) return;

    try {
      final saccoData = await _saccoService.getSavingsBalance(driverId);
      final referralData = await _referralService.getReferralStats(driverId);

      if (mounted) {
        setState(() {
          _saccoBalance =
              double.tryParse(saccoData['totalSavings']?.toString() ?? '0.0') ??
                  0.0;
          _referralBalance = double.tryParse(
                  referralData['totalEarned']?.toString() ?? '0.0') ??
              0.0;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _setGoal() async {
    final TextEditingController controller =
        TextEditingController(text: _goal.toStringAsFixed(0));

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Set Daily Goal'),
        content: TextField(
          controller: controller,
          decoration:
              const InputDecoration(prefixText: 'KES ', labelText: 'Amount'),
          keyboardType: TextInputType.number,
          autofocus: true,
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
          ElevatedButton(
              onPressed: () {
                if (controller.text.isNotEmpty) {
                  setState(() {
                    _goal = double.tryParse(controller.text) ?? _goal;
                  });
                }
                Navigator.pop(ctx);
              },
              child: const Text('SAVE')),
        ],
      ),
    );
  }

  void _cashOut() {
    setState(() {
      _balance = 0.0;
    });
    ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payout processed successfully!')));
  }

  void _topUpWallet() {
    showDialog(
        context: context,
        builder: (context) => AlertDialog(
              title: const Text("Top Up Wallet"),
              content: const Text("Initiate M-Pesa Push?"),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("Cancel")),
                ElevatedButton(
                    onPressed: () {
                      setState(() => _balance += 500);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Wallet Topped Up!")));
                    },
                    child: const Text("Pay KES 500"))
              ],
            ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.account_balance),
            onPressed: () {
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const PayoutSetupScreen()));
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchBalances,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Balance Card
                    Card(
                      color: Colors.black,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20)),
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          children: [
                            const Text('Available for Payout',
                                style: TextStyle(color: Colors.white54)),
                            const SizedBox(height: 8),
                            Text('KES ${_balance.toStringAsFixed(2)}',
                                style: const TextStyle(
                                    color: Color(0xFFFFD700),
                                    fontSize: 36,
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 24),
                            if (_balance < 50)
                              ElevatedButton(
                                onPressed: _topUpWallet,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white10,
                                  foregroundColor: Colors.white,
                                  minimumSize: const Size.fromHeight(50),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('TOP UP WALLET'),
                              )
                            else
                              ElevatedButton(
                                onPressed: _cashOut,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFFFD700),
                                  foregroundColor: Colors.black,
                                  minimumSize: const Size.fromHeight(50),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('CASH OUT NOW',
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold)),
                              ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Referral and Sacco Quick Cards
                    Row(
                      children: [
                        Expanded(
                          child: _buildBalanceCard(
                            'Referral',
                            _referralBalance,
                            const Color(0xFFFFD700),
                            Icons.group_add,
                            () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) =>
                                        const ReferralCommissionsScreen())),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildBalanceCard(
                            'Sacco',
                            _saccoBalance,
                            const Color(0xFF1A237E),
                            Icons.savings,
                            () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) => const SaccoScreen())),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    EarningsGoalProgressCard(
                      currentEarnings: _currentEarnings,
                      goalAmount: _goal,
                      weeklyGoal: _goal * 7,
                      monthlyGoal: _goal * 30,
                      onEditGoal: _setGoal,
                    ),

                    const SizedBox(height: 24),
                    const Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Recent Activity',
                            style: TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold))),
                    const SizedBox(height: 12),

                    // Semi-Dynamic Activity List
                    _buildActivityItem(
                        Icons.trending_up,
                        'Referral Bonus',
                        'New driver joined your team',
                        '+ KES 200',
                        Colors.green),
                    _buildActivityItem(
                        Icons.savings,
                        'Sacco Saving',
                        'Auto-deduction from Trip #2940',
                        '- KES 50',
                        Colors.indigo),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildBalanceCard(String title, double balance, Color color,
      IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 12),
            Text(title,
                style: const TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 4),
            Text(
              'KES ${balance.toStringAsFixed(0)}',
              style: TextStyle(
                  color: color, fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(IconData icon, String title, String subtitle,
      String amount, Color iconColor) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: iconColor.withValues(alpha: 0.1),
          child: Icon(icon, color: iconColor, size: 18),
        ),
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
        trailing: Text(amount,
            style: const TextStyle(
                fontWeight: FontWeight.bold, color: Colors.black87)),
      ),
    );
  }
}
