import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated.
class MlmCommissionPayoutDto {
  final String id;
  final DateTime date;
  final double amount;
  final String? sourceDriverName;
  final String? description;

  MlmCommissionPayoutDto({
    required this.id,
    required this.date,
    required this.amount,
    this.sourceDriverName,
    this.description,
  });
}

class MlmPayoutsScreen extends StatefulWidget {
  const MlmPayoutsScreen({super.key});

  @override
  State<MlmPayoutsScreen> createState() => _MlmPayoutsScreenState();
}

class _MlmPayoutsScreenState extends State<MlmPayoutsScreen> {
  late Future<List<MlmCommissionPayoutDto>> _payoutsFuture;

  @override
  void initState() {
    super.initState();
    _payoutsFuture = _fetchPayouts();
  }

  Future<List<MlmCommissionPayoutDto>> _fetchPayouts() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    return [
      MlmCommissionPayoutDto(
        id: 'payout-1',
        date: DateTime.now().subtract(const Duration(days: 1)),
        amount: 5.00,
        sourceDriverName: 'John D.',
      ),
      MlmCommissionPayoutDto(
        id: 'payout-2',
        date: DateTime.now().subtract(const Duration(days: 3)),
        amount: 2.50,
        sourceDriverName: 'Jane S.',
      ),
      MlmCommissionPayoutDto(
        id: 'payout-3',
        date: DateTime.now().subtract(const Duration(days: 5)),
        amount: 5.00,
        sourceDriverName: 'Peter J.',
      ),
      MlmCommissionPayoutDto( // Manual adjustment example
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
      body: FutureBuilder<List<MlmCommissionPayoutDto>>(
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
                  '${payout.amount >= 0 ? '+' : ''}\$${payout.amount.toStringAsFixed(2)}',
                  style: TextStyle(color: payout.amount >= 0 ? Colors.green : Colors.red),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
