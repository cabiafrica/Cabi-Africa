import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

// --- Data Model ---
class PayoutDetails {
  final double estimatedAmount;
  final DateTime payoutDate;

  PayoutDetails({required this.estimatedAmount, required this.payoutDate});

  factory PayoutDetails.fromJson(Map<String, dynamic> json) {
    return PayoutDetails(
      estimatedAmount: (json['estimatedAmount'] as num).toDouble(),
      payoutDate: DateTime.parse(json['payoutDate']),
    );
  }
}

// --- Mock Service ---
// In a real app, this would be in a separate service file and use an HTTP client.
class MockPaymentApiService {
  Future<PayoutDetails> fetchUpcomingPayout() async {
    // Simulate a network delay
    await Future.delayed(const Duration(seconds: 1));

    // Mock a successful response from the backend
    // In a real app, this would be an HTTP GET request to /payment/upcoming-payout
    return PayoutDetails.fromJson({
      'estimatedAmount': 1750.50,
      'payoutDate': DateTime.now()
          .add(const Duration(days: 4))
          .toIso8601String(),
    });
  }
}

/// A widget that fetches and displays the driver's next estimated payout.
class NextPayoutWidget extends StatefulWidget {
  const NextPayoutWidget({Key? key}) : super(key: key);

  @override
  _NextPayoutWidgetState createState() => _NextPayoutWidgetState();
}

class _NextPayoutWidgetState extends State<NextPayoutWidget> {
  late Future<PayoutDetails> _payoutDetailsFuture;
  final MockPaymentApiService _apiService = MockPaymentApiService();

  @override
  void initState() {
    super.initState();
    _payoutDetailsFuture = _apiService.fetchUpcomingPayout();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PayoutDetails>(
      future: _payoutDetailsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }

        if (!snapshot.hasData) {
          return const Center(child: Text('No payout information available.'));
        }

        final details = snapshot.data!;
        final currencyFormat = NumberFormat.currency(
          locale: 'en_KE',
          symbol: 'KES ',
        );
        final dateFormat = DateFormat.yMMMEd();

        return Card(
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Next Payout',
                  style: Theme.of(context).textTheme.headline6,
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
                      currencyFormat.format(details.estimatedAmount),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Divider(),
                const SizedBox(height: 8),
                Text('Expected on: ${dateFormat.format(details.payoutDate)}'),
              ],
            ),
          ),
        );
      },
    );
  }
}
