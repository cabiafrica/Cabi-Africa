import 'package:flutter/material.dart';
import '../widgets/withdrawal_request_sheet.dart';
import 'payout_methods_screen.dart';
import '../services/ride_service.dart';

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  // Mock data for the MVP
  double _walletBalance = 5430.0;
  final String todaysEarnings = "KES 1,250";
  final String thisWeeksEarnings = "KES 8,750";
  final List<Map<String, String>> recentTrips = const [
    {'time': '14:30', 'fare': 'KES 450'},
    {'time': '11:15', 'fare': 'KES 300'},
    {'time': '09:00', 'fare': 'KES 500'},
  ];

  final RideService _rideService = RideService();
  String _defaultPayoutMethod = 'Loading...';

  @override
  void initState() {
    super.initState();
    _loadDefaultPayoutMethod();
  }

  Future<void> _loadDefaultPayoutMethod() async {
    final method = await _rideService.getDefaultPayoutMethod();
    if (mounted && method != null) {
      setState(() {
        _defaultPayoutMethod = method.display;
      });
    }
  }

  void _showWithdrawalSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => WithdrawalRequestSheet(
        availableBalance: _walletBalance,
        payoutMethodDisplay: _defaultPayoutMethod,
        onConfirm: _handleWithdrawal,
      ),
    );
  }

  Future<void> _handleWithdrawal(double amount) async {
    await _rideService.requestPayout(amount);
    if (!mounted) return;
    setState(() {
      _walletBalance -= amount;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Withdrawal request submitted successfully!'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Earnings'), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBalanceCard(context),
            const SizedBox(height: 24),
            _buildSummaryCards(context),
            const SizedBox(height: 24),
            _buildChartPlaceholder(context),
            const SizedBox(height: 24),
            _buildRecentTrips(context),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Wallet Balance',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(color: Colors.grey[600]),
            ),
            const SizedBox(height: 8),
            Text(
              'KES ${_walletBalance.toStringAsFixed(0)}',
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _showWithdrawalSheet,
                    child: const Text('Withdraw'),
                  ),
                ),
                const SizedBox(width: 16),
                TextButton(
                  onPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const PayoutMethodsScreen(),
                      ),
                    );
                    _loadDefaultPayoutMethod(); // Refresh after returning
                  },
                  child: const Text('Manage'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCards(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildSummaryCard(context, "Today's Earnings", todaysEarnings),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildSummaryCard(
            context,
            "This Week's Earnings",
            thisWeeksEarnings,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(BuildContext context, String title, String amount) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            Text(
              amount,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChartPlaceholder(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Weekly Overview', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 16),
        Container(
          height: 150,
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(child: Text('Chart Placeholder')),
        ),
      ],
    );
  }

  Widget _buildRecentTrips(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Recent Trips', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        ...recentTrips.map(
          (trip) => ListTile(
            leading: const Icon(
              Icons.check_circle_outline,
              color: Colors.green,
            ),
            title: Text('Trip at ${trip['time']}'),
            trailing: Text(
              trip['fare']!,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}
