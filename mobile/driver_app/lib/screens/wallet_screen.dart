import 'package:flutter/material.dart';
import 'mlm_commissions_screen.dart';
import 'payout_setup_screen.dart';
import '../widgets/earnings_goal_progress_card.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  // Mock Data
  double _balance = 154.50;
  double _goal = 200.00;
  double _currentEarnings = 154.50;

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
              const InputDecoration(prefixText: '\$', labelText: 'Amount'),
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
    // API Call
    setState(() {
      _balance = 0.0;
    });
    ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payout processed successfully!')));
  }

  Widget _buildHeatmapRow(String label, List<int> intensities) {
    return Row(
      children: [
        SizedBox(
            width: 40,
            child: Text(label,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: Colors.grey))),
        ...intensities.map((level) => Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.green
                      .withValues(alpha: level * 0.2), // Maps 1-5 to 0.2-1.0
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            )),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_balance),
            tooltip: 'Payout Methods',
            onPressed: () {
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const PayoutSetupScreen()));
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Balance Card
            Card(
              color: Colors.black87,
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    const Text('Available Balance',
                        style: TextStyle(color: Colors.white70)),
                    const SizedBox(height: 8),
                    Text('\$${_balance.toStringAsFixed(2)}',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 36,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _balance > 5 ? _cashOut : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(50),
                      ),
                      child: const Text('CASH OUT NOW'),
                    ),
                    const SizedBox(height: 8),
                    const Text('Usually arrives in minutes. \$0.50 fee.',
                        style: TextStyle(color: Colors.white54, fontSize: 12)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Loyalty Points Card (Story 62.2)
            Card(
              color: Colors.deepPurple,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 16.0, horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Loyalty Points',
                            style: TextStyle(color: Colors.white70)),
                        Text('1,250',
                            style: TextStyle(
                                color: Colors.amber,
                                fontSize: 24,
                                fontWeight: FontWeight.bold)),
                      ],
                    ),
                    OutlinedButton(
                      onPressed: () {
                        // Navigate to Store (circular dependency if we import store here, so verify structure?
                        // Actually store screen is separate. We can navigate or just show info dialog)
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Redeem at Driver Store')));
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white),
                      ),
                      child: const Text('REDEEM'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Commissions Card (New!)
            GestureDetector(
              onTap: () {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const MlmCommissionsScreen()));
              },
              child: Card(
                color: Colors.blue[800],
                child: const Padding(
                  padding: EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.group_add, color: Colors.white, size: 32),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('MLM Commissions',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16)),
                            Text('View your referral earnings',
                                style: TextStyle(color: Colors.white70)),
                          ],
                        ),
                      ),
                      Icon(Icons.arrow_forward_ios,
                          color: Colors.white54, size: 16),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Goal Widget (Story 140.1)
            EarningsGoalProgressCard(
              currentEarnings: _currentEarnings,
              goalAmount: _goal,
              onEditGoal: _setGoal,
            ),
            const SizedBox(height: 24),

            // Story 56.6: Earnings Heatmap
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Best Times to Drive',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text('Based on your historical earnings',
                        style: TextStyle(color: Colors.grey, fontSize: 12)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const SizedBox(width: 40), // Label spacing
                        ...['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) =>
                            Expanded(
                                child: Center(
                                    child: Text(d,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12))))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    _buildHeatmapRow('AM', [1, 2, 3, 2, 4, 3, 1]),
                    const SizedBox(height: 4),
                    _buildHeatmapRow('PM', [2, 3, 4, 3, 5, 5, 4]),
                    const SizedBox(height: 4),
                    _buildHeatmapRow('Eve', [4, 4, 5, 5, 5, 5, 2]),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        const Text('Low', style: TextStyle(fontSize: 10)),
                        const SizedBox(width: 4),
                        Container(
                            width: 10,
                            height: 10,
                            color: Colors.green.withValues(alpha: 0.2)),
                        const SizedBox(width: 2),
                        Container(
                            width: 10,
                            height: 10,
                            color: Colors.green.withValues(alpha: 0.5)),
                        const SizedBox(width: 2),
                        Container(width: 10, height: 10, color: Colors.green),
                        const SizedBox(width: 4),
                        const Text('High', style: TextStyle(fontSize: 10)),
                      ],
                    )
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),
            const Align(
                alignment: Alignment.centerLeft,
                child: Text('Recent Transactions',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
            const SizedBox(height: 8),
            // Mock List
            ListTile(
              leading: const Icon(Icons.drive_eta, color: Colors.blue),
              title: const Text('Trip Payment'),
              subtitle: const Text('Today, 2:30 PM'),
              trailing: const Text('+\$25.50',
                  style: TextStyle(
                      color: Colors.green, fontWeight: FontWeight.bold)),
            ),
            ListTile(
              leading: const Icon(Icons.local_gas_station,
                  color: Colors.orange), // Payment
              title: const Text('Instant Payout'),
              subtitle: const Text('Yesterday'),
              trailing: const Text('-\$120.00',
                  style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
