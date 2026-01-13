import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated.
class ReferralCommissionPayoutDto {
  final String id;
  final DateTime date;
  final double amount;
  final String? sourceDriverName;
  final String? description;

  ReferralCommissionPayoutDto({
    required this.id,
    required this.date,
    required this.amount,
    this.sourceDriverName,
    this.description,
  });
}

class ReferralPayoutsScreen extends StatefulWidget {
  const ReferralPayoutsScreen({super.key});

  @override
  State<ReferralPayoutsScreen> createState() => _ReferralPayoutsScreenState();
}

class _ReferralPayoutsScreenState extends State<ReferralPayoutsScreen> {
  late Future<List<ReferralCommissionPayoutDto>> _payoutsFuture;

  @override
  void initState() {
    super.initState();
    _payoutsFuture = _fetchPayouts();
  }

  Future<List<ReferralCommissionPayoutDto>> _fetchPayouts() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    return [
      ReferralCommissionPayoutDto(
        id: 'payout-1',
        date: DateTime.now().subtract(const Duration(days: 1)),
        amount: 5.00,
        sourceDriverName: 'John D.',
      ),
      ReferralCommissionPayoutDto(
        id: 'payout-2',
        date: DateTime.now().subtract(const Duration(days: 3)),
        amount: 2.50,
        sourceDriverName: 'Jane S.',
      ),
      ReferralCommissionPayoutDto(
        id: 'payout-3',
        date: DateTime.now().subtract(const Duration(days: 5)),
        amount: 5.00,
        sourceDriverName: 'Peter J.',
      ),
      ReferralCommissionPayoutDto(
        // Manual adjustment example
        id: 'manual-1',
        date: DateTime.now().subtract(const Duration(hours: 2)),
        amount: 50.00,
        description: 'Manual Bonus: Great performance (Admin: admin-1)',
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Commission Payouts')),
      body: FutureBuilder<List<ReferralCommissionPayoutDto>>(
        future: _payoutsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError ||
              !snapshot.hasData ||
              snapshot.data!.isEmpty) {
            return const Center(child: Text('No commission payouts yet.'));
          }

          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              final payout = snapshot.data![index];
              return ListTile(
                title: Text(payout.sourceDriverName != null
                    ? 'Commission from ${payout.sourceDriverName}'
                    : payout.description ?? 'Adjustment'),
                subtitle: Text(payout.date.toLocal().toString().split(' ')[0]),
                trailing: Text(
                  '${payout.amount >= 0 ? '+' : ''}KES ${payout.amount.toStringAsFixed(2)}',
                  style: TextStyle(
                      color: payout.amount >= 0 ? Colors.green : Colors.red),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
