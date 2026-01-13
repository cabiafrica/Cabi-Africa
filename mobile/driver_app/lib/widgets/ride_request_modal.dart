import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../screens/trip_in_progress_screen.dart';

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
              builder: (context) =>
                  TripInProgressScreen(rideId: requestData['rideId']),
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

    void handleReject() {
      service.rejectRide(requestData['rideId'], driverId);
      rideProvider.clearRideRequest();
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
                      onPressed: handleReject,
                      style:
                          ElevatedButton.styleFrom(backgroundColor: Colors.red),
                      child: const Text('Reject'),
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
