import 'package:flutter/material.dart';

// Mock data model for demonstration
class RideRequest {
  final String rideId;
  final String pickupLocation;
  final String destination;
  final double estimatedFare;
  final bool isLongTrip;

  RideRequest({
    required this.rideId,
    required this.pickupLocation,
    required this.destination,
    required this.estimatedFare,
    this.isLongTrip = false,
  });
}

class RideRequestCard extends StatelessWidget {
  final RideRequest ride;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const RideRequestCard({
    super.key,
    required this.ride,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16.0),
      elevation: 8,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'New Ride Request',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                if (ride.isLongTrip)
                  const Chip(
                    label: Text('Long Trip'),
                    backgroundColor: Colors.blueAccent,
                    labelStyle: TextStyle(color: Colors.white),
                    padding: EdgeInsets.symmetric(horizontal: 8.0),
                  ),
              ],
            ),
            const Divider(height: 24),
            _buildInfoRow(
              icon: Icons.location_on,
              label: 'Pickup',
              value: ride.pickupLocation,
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              icon: Icons.flag,
              label: 'Destination',
              value: ride.destination,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(onPressed: onDecline, child: const Text('Decline')),
                ElevatedButton(
                  onPressed: onAccept,
                  child: const Text('Accept'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, color: Colors.grey.shade600, size: 20),
        const SizedBox(width: 12),
        Expanded(child: Text(value, style: const TextStyle(fontSize: 16))),
      ],
    );
  }
}
