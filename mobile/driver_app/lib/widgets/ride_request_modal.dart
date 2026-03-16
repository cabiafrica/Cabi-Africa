import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../screens/trip_in_progress_screen.dart';
import 'package:driver_app/widgets/badge_showcase_widget.dart';
import 'package:driver_app/services/badge_service.dart' as badge_service;

class RideRequestModal extends StatelessWidget {
  final Map<String, dynamic> requestData;
  final RideService? rideService;
  final String driverId; // Added

  const RideRequestModal(
      {super.key,
      required this.requestData,
      this.rideService,
      required this.driverId});

  @override
  Widget build(BuildContext context) {
    final rideProvider = Provider.of<RideRequestProvider>(context);
    final service = rideService ?? RideService();

    void handleAccept() async {
      try {
        await service.acceptRide(
            requestData['rideId'], driverId); // Pass driverId
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Ride Accepted! Navigating to pickup...')),
          );
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => TripInProgressScreen(
                  rideId: requestData['rideId'], driverId: driverId),
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to accept ride: $e')),
          );
        }
      } finally {
        rideProvider.clearRideRequest();
      }
    }

    void handlePass({String? reason}) {
      // If passenger is not verified, add default reason
      final passReason = reason ?? 
          (requestData['isVerifiedPassenger'] == false 
              ? 'unverified passenger' 
              : null);
      service.rejectRide(requestData['rideId'], driverId, passReason);
      rideProvider.clearRideRequest();
    }

    void showPassDialog() {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Pass Trip'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (requestData['isVerifiedPassenger'] == false) ...[
                const Text('This passenger is not verified. Would you like to pass on this trip with a reason?'),
                const SizedBox(height: 16),
              ],
              const Text('Are you sure you want to pass this trip to the next available driver?'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            if (requestData['isVerifiedPassenger'] == false)
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  handlePass(reason: 'unverified passenger');
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                child: const Text('Pass (Unverified)'),
              ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                handlePass();
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Pass'),
            ),
          ],
        ),
      );
    }

    return Container(
      color: Colors.black.withValues(alpha: 0.5),
      child: Center(
        child: Card(
          margin: const EdgeInsets.all(20),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'New Ride Request',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),
                Text('Pickup: ${requestData['pickupAddress']}'),
                Text('Distance to pickup: ${requestData['distanceToPickup']}'),
                Text('Passenger Rating: ${requestData['passengerRating']} ★'),
                
                // Show passenger verification status
                if (requestData['isVerifiedPassenger'] == true) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green[100],
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified, size: 16, color: Colors.green[700]),
                        const SizedBox(width: 4),
                        Text(
                          'Verified Passenger',
                          style: TextStyle(color: Colors.green[700], fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.orange[100],
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.warning, size: 16, color: Colors.orange[700]),
                        const SizedBox(width: 4),
                        Text(
                          'Unverified',
                          style: TextStyle(color: Colors.orange[700], fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'This passenger has not verified their identity',
                    style: TextStyle(color: Colors.orange[700], fontSize: 12),
                  ),
                ],
                if ((requestData['passengerBadges'] as List?)?.isNotEmpty ??
                    false) ...[
                  const SizedBox(height: 12),
                  BadgeShowcaseWidget(
                    badges: (requestData['passengerBadges'] as List)
                        .cast<badge_service.Badge>(),
                    compact: true,
                  ),
                ],
                const SizedBox(height: 24),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      height: 60,
                      width: 60,
                      child: CircularProgressIndicator(
                        value: rideProvider.countdown / 30.0,
                        strokeWidth: 6,
                        backgroundColor: Colors.grey.shade300,
                      ),
                    ),
                    Text(
                      '${rideProvider.countdown}',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    ElevatedButton(
                      onPressed: showPassDialog,
                      style:
                          ElevatedButton.styleFrom(backgroundColor: Colors.red),
                      child: const Text('Pass'),
                    ),
                    ElevatedButton(
                      onPressed: handleAccept,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green),
                      child: const Text('Accept'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
