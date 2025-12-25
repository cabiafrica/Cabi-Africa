import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/providers.dart';

class RideRequestModal extends ConsumerWidget {
  final Map<String, dynamic> rideDetails;

  const RideRequestModal({super.key, required this.rideDetails});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rideService = ref.read(rideServiceProvider);
    final rideId = rideDetails['rideId'] as String;

    void acceptRide() {
      rideService.acceptRide(rideId);
      Navigator.of(context).pop();
    }

    void rejectRide() {
      rideService.rejectRide(rideId);
      Navigator.of(context).pop();
    }

    return Container(
      padding: const EdgeInsets.all(20.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'New Ride Request!',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          _buildDetailRow(
            context,
            icon: Icons.location_on,
            label: 'FROM',
            value: rideDetails['pickupLocation'] ?? 'Unknown Pickup',
            color: Colors.blue,
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            context,
            icon: Icons.flag,
            label: 'TO',
            value: rideDetails['destination'] ?? 'Unknown Destination',
            color: Colors.red,
          ),
          const Divider(height: 32),
          Text(
            'Est. Fare: KES ${rideDetails['estimatedFare']?.toStringAsFixed(0) ?? 'N/A'}',
            style: Theme.of(
              context,
            ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: rejectRide,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[700],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('REJECT'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: acceptRide,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[700],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('ACCEPT'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: Theme.of(context).textTheme.bodySmall),
              Text(value, style: Theme.of(context).textTheme.bodyLarge),
            ],
          ),
        ),
      ],
    );
  }
}
