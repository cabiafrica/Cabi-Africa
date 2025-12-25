import 'package:flutter/material.dart';

class WaitingForPassengerPanel extends StatelessWidget {
  final Map<String, dynamic> rideDetails;
  final VoidCallback onStartTrip;

  const WaitingForPassengerPanel({
    super.key,
    required this.rideDetails,
    required this.onStartTrip,
  });

  @override
  Widget build(BuildContext context) {
    final passengerName = rideDetails['passengerName'] ?? 'Jane Doe';

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Card(
        margin: const EdgeInsets.all(16.0),
        elevation: 8,
        color: Colors.green[50],
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Waiting for $passengerName',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(color: Colors.green[800]),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: onStartTrip,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green[700],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'START TRIP',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
