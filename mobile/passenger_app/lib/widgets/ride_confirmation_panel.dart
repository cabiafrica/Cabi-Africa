import 'package:flutter/material.dart';

class RideConfirmationPanel extends StatelessWidget {
  final String pickupAddress;
  final String destinationAddress;
  final double estimatedFare;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const RideConfirmationPanel({
    super.key,
    required this.pickupAddress,
    required this.destinationAddress,
    required this.estimatedFare,
    required this.onConfirm,
    required this.onCancel,
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
            children: [
              Row(
                children: [
                  const Text('Est. Fare:', style: TextStyle(fontSize: 20)),
                  const Spacer(),
                  Text(
                    'KES ${estimatedFare.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              ListTile(
                leading: const Icon(Icons.my_location, color: Colors.blue),
                title: const Text('Pickup'),
                subtitle: Text(pickupAddress, overflow: TextOverflow.ellipsis),
              ),
              ListTile(
                leading: const Icon(Icons.location_on, color: Colors.red),
                title: const Text('Destination'),
                subtitle: Text(
                  destinationAddress,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onCancel,
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: onConfirm,
                      child: const Text('Confirm Ride'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
