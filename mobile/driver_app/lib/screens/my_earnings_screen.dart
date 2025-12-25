import 'package:flutter/material.dart';

// Import the new screen
import 'weekly_statements_screen.dart';

// --- MOCK MODELS AND SERVICES FOR DEMONSTRATION ---

class EarningsSummary {
  final double tripEarnings;
  final double commissionEarnings;
  final double total;

  EarningsSummary({
    required this.tripEarnings,
    required this.commissionEarnings,
    required this.total,
  });

  factory EarningsSummary.fromJson(Map<String, dynamic> json) {
    return EarningsSummary(
      tripEarnings: (json['tripEarnings'] as num).toDouble(),
      commissionEarnings: (json['commissionEarnings'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
    );
  }
}

class Transaction {
  final String id;
  final String date;
  final String type;
  final double amount;
  final String description;

  Transaction({
    required this.id,
    required this.date,
    required this.type,
    required this.amount,
    required this.description,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      date: json['date'],
      type: json['type'],
      amount: (json['amount'] as num).toDouble(),
      description: json['description'],
    );
  }
}

class EarningsData {
  final Map<String, EarningsSummary> summary;
  final List<Transaction> recentTransactions;

  EarningsData({required this.summary, required this.recentTransactions});

  factory EarningsData.fromJson(Map<String, dynamic> json) {
    return EarningsData(
      summary: (json['summary'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(key, EarningsSummary.fromJson(value)),
      ),
      recentTransactions: (json['recentTransactions'] as List)
          .map((item) => Transaction.fromJson(item))
          .toList(),
    );
  }
}

class EarningsService {
  Future<EarningsData> fetchMyEarnings() async {
    print("Fetching earnings from mock service...");
    await Future.delayed(const Duration(seconds: 1));
    // In a real app, this would make an HTTP GET request to `/api/earnings/my-summary`
    final mockApiResponse = {
      "summary": {
        "today": {
          "tripEarnings": 75.50,
          "commissionEarnings": 10.00,
          "total": 85.50,
        },
        "thisWeek": {
          "tripEarnings": 450.25,
          "commissionEarnings": 55.75,
          "total": 506.00,
        },
        "thisMonth": {
          "tripEarnings": 1890.80,
          "commissionEarnings": 210.50,
          "total": 2101.30,
        },
      },
      "recentTransactions": [
        {
          "id": "txn-1",
          "date": "2024-08-22T14:30:00Z",
          "type": "Trip Fare",
          "amount": 22.50,
          "description": "Trip to Downtown",
        },
        {
          "id": "txn-2",
          "date": "2024-08-22T11:00:00Z",
          "type": "Trip Fare",
          "amount": 15.75,
          "description": "Trip to Airport",
        },
        {
          "id": "txn-3",
          "date": "2024-08-21T18:00:00Z",
          "type": "Commission",
          "amount": 5.00,
          "description": "Referral bonus from Jane D.",
        },
        {
          "id": "txn-4",
          "date": "2024-08-21T10:00:00Z",
          "type": "Trip Fare",
          "amount": 37.25,
          "description": "Trip to North Suburbs",
        },
      ],
    };
    return EarningsData.fromJson(mockApiResponse);
  }

  Future<void> requestPayout(double amount) async {
    print("Requesting payout of \$$amount...");
    await Future.delayed(const Duration(seconds: 1));
  }
}

// --- WIDGET IMPLEMENTATION ---

class MyEarningsScreen extends StatefulWidget {
  final EarningsService? earningsService;

  const MyEarningsScreen({Key? key, this.earningsService}) : super(key: key);

  @override
  _MyEarningsScreenState createState() => _MyEarningsScreenState();
}

class _MyEarningsScreenState extends State<MyEarningsScreen> {
  late Future<EarningsData> _earningsFuture;
  late final EarningsService _earningsService;
  String _selectedPeriod = 'thisWeek';

  @override
  void initState() {
    super.initState();
    _earningsService = widget.earningsService ?? EarningsService();
    _earningsFuture = _earningsService.fetchMyEarnings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Earnings')),
      body: FutureBuilder<EarningsData>(
        future: _earningsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('No earnings data available.'));
          }

          final earningsData = snapshot.data!;
          final summary = earningsData.summary[_selectedPeriod]!;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Period Selector
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'today', label: Text('Today')),
                    ButtonSegment(value: 'thisWeek', label: Text('Week')),
                    ButtonSegment(value: 'thisMonth', label: Text('Month')),
                  ],
                  selected: {_selectedPeriod},
                  onSelectionChanged: (newSelection) {
                    setState(() => _selectedPeriod = newSelection.first);
                  },
                ),
                const SizedBox(height: 24),

                // Summary Card
                Card(
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        Text(
                          'Total Earnings',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          '\$${summary.total.toStringAsFixed(2)}',
                          style: Theme.of(context).textTheme.displaySmall,
                        ),
                        const Divider(height: 32),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildEarningsDetail(
                              'Trip Fares',
                              summary.tripEarnings,
                            ),
                            _buildEarningsDetail(
                              'Commissions',
                              summary.commissionEarnings,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _handlePayoutRequest(summary.total),
                    child: const Text('Request Payout'),
                  ),
                ),
                const SizedBox(height: 24),

                // Recent Transactions
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Recent Transactions',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) =>
                                const WeeklyStatementsScreen(),
                          ),
                        );
                      },
                      child: const Text('View Statements'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ...earningsData.recentTransactions.map(
                  (tx) => ListTile(
                    leading: Icon(
                      tx.type == 'Trip Fare' ? Icons.local_taxi : Icons.group,
                    ),
                    title: Text(tx.description),
                    subtitle: Text(tx.type),
                    trailing: Text(
                      '+\$${tx.amount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _handlePayoutRequest(double amount) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Payout'),
        content: Text('Request a payout of \$${amount.toStringAsFixed(2)}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Submitting your payout request...')),
      );
      await _earningsService.requestPayout(amount);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payout request submitted successfully!')),
      );
    }
  }

  Widget _buildEarningsDetail(String title, double amount) {
    return Column(
      children: [
        Text(title, style: Theme.of(context).textTheme.bodySmall),
        Text(
          '\$${amount.toStringAsFixed(2)}',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ],
    );
  }
}
