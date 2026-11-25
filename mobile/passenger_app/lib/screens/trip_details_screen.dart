import 'package:flutter/material.dart';

class TripDetailsScreen extends StatelessWidget {
  final Map<String, String> trip;

  const TripDetailsScreen({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    final fareString = trip['fare'] ?? '0';
    final numericFare =
        double.tryParse(fareString.replaceAll(RegExp(r'[^0-9.]'), '')) ?? 0.0;
    final platformFee = numericFare * 0.18;
    final earnings = numericFare * 0.82;

    return Scaffold(
      appBar: AppBar(title: const Text('Trip Details')),
      body: Column(
        children: [
          // Map Placeholder
          Container(
            height: 250,
            color: Colors.grey[300],
            width: double.infinity,
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 48, color: Colors.grey),
                  SizedBox(height: 8),
                  Text('Route Map Placeholder'),
                ],
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildAddressSection(context),
                  const Divider(height: 32),
                  _buildFinancialSection(
                    context,
                    numericFare,
                    platformFee,
                    earnings,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.my_location, color: Colors.green, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Pickup', style: Theme.of(context).textTheme.bodySmall),
                  const Text(
                    '123 Mock Pickup St',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            const Icon(Icons.location_on, color: Colors.red, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Destination',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  Text(
                    trip['destination'] ?? 'Unknown',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.only(left: 32.0),
          child: Text(
            trip['date'] ?? '',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ],
    );
  }

  Widget _buildFinancialSection(
    BuildContext context,
    double fare,
    double fee,
    double earnings,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Financial Breakdown',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 16),
        _buildFinancialRow('Total Fare', 'KES ${fare.toStringAsFixed(2)}'),
        const SizedBox(height: 8),
        _buildFinancialRow(
          'Platform Fee (18%)',
          '- KES ${fee.toStringAsFixed(2)}',
          isDeduction: true,
        ),
        const Divider(height: 24),
        _buildFinancialRow(
          'Your Earnings',
          'KES ${earnings.toStringAsFixed(2)}',
          isTotal: true,
        ),
      ],
    );
  }

  Widget _buildFinancialRow(
    String label,
    String amount, {
    bool isDeduction = false,
    bool isTotal = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            fontSize: isTotal ? 18 : 14,
          ),
        ),
        Text(
          amount,
          style: TextStyle(
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            fontSize: isTotal ? 18 : 14,
            color: isDeduction
                ? Colors.red
                : (isTotal ? Colors.green : Colors.black),
          ),
        ),
      ],
    );
  }
}
