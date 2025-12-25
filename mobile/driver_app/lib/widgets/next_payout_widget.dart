import 'package:flutter/material.dart';

// Mock data model. In a real app, this would be generated from JSON.
class UpcomingPayout {
  final double estimatedAmount;
  final DateTime expectedPayoutDate;

  UpcomingPayout({
    required this.estimatedAmount,
    required this.expectedPayoutDate,
  });
}

// Mock service. In a real app, this would make an HTTP request.
class PayoutService {
  Future<UpcomingPayout> getUpcomingPayout() async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    // Find the next Friday
    var payoutDate = DateTime.now();
    while (payoutDate.weekday != DateTime.friday) {
      payoutDate = payoutDate.add(const Duration(days: 1));
    }

    return UpcomingPayout(
      estimatedAmount: 125.50,
      expectedPayoutDate: payoutDate,
    );
  }
}

class NextPayoutWidget extends StatefulWidget {
  const NextPayoutWidget({super.key});

  @override
  State<NextPayoutWidget> createState() => _NextPayoutWidgetState();
}

class _NextPayoutWidgetState extends State<NextPayoutWidget> {
  final PayoutService _payoutService = PayoutService();
  late Future<UpcomingPayout> _payoutFuture;

  @override
  void initState() {
    super.initState();
    _payoutFuture = _payoutService.getUpcomingPayout();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: FutureBuilder<UpcomingPayout>(
          future: _payoutFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError || !snapshot.hasData) {
              return const Center(
                child: Text('Could not load payout details.'),
              );
            }

            final payout = snapshot.data!;
            final formattedDate =
                "${payout.expectedPayoutDate.month}/${payout.expectedPayoutDate.day}/${payout.expectedPayoutDate.year}";

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Next Payout',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Estimated Amount',
                      style: TextStyle(fontSize: 16),
                    ),
                    Text(
                      '\$${payout.estimatedAmount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Expected Payout Date',
                      style: TextStyle(fontSize: 16),
                    ),
                    Text(formattedDate, style: const TextStyle(fontSize: 16)),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
