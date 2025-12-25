import 'package:flutter/material.dart';

// Mock DTOs - In a real app, these would be generated.
class EarningsPeriodSummary {
  final double tripEarnings;
  final double commissionEarnings;
  final double total;
  EarningsPeriodSummary({
    required this.tripEarnings,
    required this.commissionEarnings,
    required this.total,
  });
}

class TransactionDto {
  final String id;
  final DateTime date;
  final String type;
  final double amount;
  final String description;
  TransactionDto({
    required this.id,
    required this.date,
    required this.type,
    required this.amount,
    required this.description,
  });
}

class EarningsSummaryDto {
  final Map<String, EarningsPeriodSummary> summary;
  final List<TransactionDto> recentTransactions;
  EarningsSummaryDto({required this.summary, required this.recentTransactions});
}

class EarningsHistoryScreen extends StatefulWidget {
  const EarningsHistoryScreen({super.key});

  @override
  State<EarningsHistoryScreen> createState() => _EarningsHistoryScreenState();
}

class _EarningsHistoryScreenState extends State<EarningsHistoryScreen> {
  late Future<EarningsSummaryDto> _summaryFuture;

  @override
  void initState() {
    super.initState();
    _summaryFuture = _fetchSummary();
  }

  Future<EarningsSummaryDto> _fetchSummary() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    return EarningsSummaryDto(
      summary: {
        'today': EarningsPeriodSummary(
          tripEarnings: 75.5,
          commissionEarnings: 10.0,
          total: 85.5,
        ),
        'thisWeek': EarningsPeriodSummary(
          tripEarnings: 450.25,
          commissionEarnings: 55.75,
          total: 506.0,
        ),
      },
      recentTransactions: [
        TransactionDto(
          id: 'txn-1',
          date: DateTime.now(),
          type: 'Trip Fare',
          amount: 22.5,
          description: 'Trip to Downtown',
        ),
        TransactionDto(
          id: 'txn-2',
          date: DateTime.now().subtract(const Duration(hours: 3)),
          type: 'Trip Fare',
          amount: 15.75,
          description: 'Trip to Airport',
        ),
        TransactionDto(
          id: 'txn-3',
          date: DateTime.now().subtract(const Duration(days: 1)),
          type: 'Commission',
          amount: 5.0,
          description: 'Referral bonus from Jane D.',
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Earnings')),
      body: FutureBuilder<EarningsSummaryDto>(
        future: _summaryFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load earnings.'));
          }

          final summary = snapshot.data!;

          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Text(
                        'Today: \$${summary.summary['today']!.total.toStringAsFixed(2)}',
                      ),
                      Text(
                        'This Week: \$${summary.summary['thisWeek']!.total.toStringAsFixed(2)}',
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 8.0,
                  ),
                  child: Text(
                    'Recent Transactions',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final txn = summary.recentTransactions[index];
                  return ListTile(
                    title: Text(txn.description),
                    subtitle: Text(
                      '${txn.type} - ${txn.date.toLocal().toString().split(' ')[0]}',
                    ),
                    trailing: Text(
                      '${txn.amount > 0 ? '+' : ''}\$${txn.amount.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: txn.amount > 0 ? Colors.green : Colors.red,
                      ),
                    ),
                  );
                }, childCount: summary.recentTransactions.length),
              ),
            ],
          );
        },
      ),
    );
  }
}
