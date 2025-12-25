import 'package:flutter/material.dart';

// --- Mock Data Models & Service ---

class PendingChange {
  final String newStopAddress;
  final double newEstimatedFare;

  PendingChange({required this.newStopAddress, required this.newEstimatedFare});
}

class RideService {
  Future<void> respondToChange(String rideId, String response) async {
    // In a real app, this would call the backend's respondToChange endpoint.
    await Future.delayed(const Duration(milliseconds: 500));
    print('Driver responded with "$response" for ride $rideId');
  }
}

// --- UI Implementation ---

class TripInProgressPanel extends StatelessWidget {
  final String rideId;
  final String currentDestination;
  final PendingChange? pendingChange;
  final VoidCallback onNavigate;

  const TripInProgressPanel({
    super.key,
    required this.rideId,
    required this.currentDestination,
    required this.onNavigate,
    this.pendingChange,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // The main panel with current trip info
        _buildMainPanel(context),

        // The overlay for the trip change request
        if (pendingChange != null) _buildChangeRequestOverlay(context),
      ],
    );
  }

  Widget _buildMainPanel(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      width: double.infinity,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.flag_circle_outlined),
            title: const Text('Current Destination'),
            subtitle: Text(
              currentDestination,
              style: const TextStyle(fontSize: 16),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            icon: const Icon(Icons.navigation),
            label: const Text('Navigate'),
            onPressed: onNavigate,
          ),
        ],
      ),
    );
  }

  Widget _buildChangeRequestOverlay(BuildContext context) {
    final rideService = RideService();

    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.5),
        child: Center(
          child: Card(
            margin: const EdgeInsets.all(24.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Trip Update Requested',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  Text('New Stop: ${pendingChange!.newStopAddress}'),
                  Text(
                    'New Fare: ~KES ${pendingChange!.newEstimatedFare.toStringAsFixed(2)}',
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      TextButton(
                        onPressed: () =>
                            rideService.respondToChange(rideId, 'declined'),
                        child: const Text('Decline'),
                      ),
                      ElevatedButton(
                        onPressed: () =>
                            rideService.respondToChange(rideId, 'accepted'),
                        child: const Text('Accept'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
