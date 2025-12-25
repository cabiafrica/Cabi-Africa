import 'package:flutter/material.dart';
import '../services/ride_service.dart';

class PayoutHistoryScreen extends StatefulWidget {
  const PayoutHistoryScreen({Key? key}) : super(key: key);

  @override
  State<PayoutHistoryScreen> createState() => _PayoutHistoryScreenState();
}

class _PayoutHistoryScreenState extends State<PayoutHistoryScreen> {
  final RideService _rideService = RideService();
  late Future<List<PayoutTransaction>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = _rideService.getPayoutHistory();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payout History')),
      body: FutureBuilder<List<PayoutTransaction>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(child: Text('Error loading history'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No payout history found.'));
          }

          final transactions = snapshot.data!;
          return ListView.separated(
            itemCount: transactions.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final tx = transactions[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.grey[200],
                  child: const Icon(Icons.receipt_long, color: Colors.black54),
                ),
                title: Text(
                  'KES ${tx.amount.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tx.destination),
                    Text(tx.date, style: const TextStyle(fontSize: 12)),
                  ],
                ),
                trailing: Text(
                  tx.status,
                  style: TextStyle(
                    color: _getStatusColor(tx.status),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
