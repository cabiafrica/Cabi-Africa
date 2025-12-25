import 'package:flutter/material.dart';

class TripDetailsPanel extends StatelessWidget {
  final Map<String, dynamic> rideDetails;
  final VoidCallback onArrived;

  const TripDetailsPanel({
    super.key,
    required this.rideDetails,
    required this.onArrived,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Material(
        elevation: 10,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Navigating to Passenger',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.person_pin_circle_outlined),
                title: Text(rideDetails['passengerName'] ?? 'Passenger'),
                subtitle: Text(
                  rideDetails['pickupLocation'] ?? 'Pickup Address',
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: onArrived,
                child: const Text("I've Arrived"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
