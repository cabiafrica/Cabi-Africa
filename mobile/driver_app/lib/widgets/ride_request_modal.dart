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
                rideId: requestData['rideId'],
                driverId: driverId,
                isExtendedPickup: requestData['isExtendedPickup'] == true,
                subsidyAmount: (requestData['extendedPickupSubsidy'] as num?)?.toDouble(),
              ),
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
      final passReason = reason ?? 
          (requestData['isVerifiedPassenger'] == false 
              ? 'unverified passenger' 
              : 'Driver passed trip');
      service.passRide(requestData['rideId'], driverId, passReason);
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

                // Show Extended Pickup System Subsidy
                if (requestData['isExtendedPickup'] == true ||
                    (requestData['extendedPickupSubsidy'] != null &&
                        (requestData['extendedPickupSubsidy'] as num) > 0)) ...[
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFFD4AF37),
                        width: 1.2,
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.bolt_rounded, size: 18, color: Color(0xFFD4AF37)),
                            const SizedBox(width: 6),
                            Text(
                              '+KES ${requestData['extendedPickupSubsidy'] ?? 60} System Fuel Subsidy',
                              style: const TextStyle(
                                color: Color(0xFFD4AF37),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Passenger is beyond your standard radius. Cabi compensates your extra mileage directly to your wallet.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.grey.shade400,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                
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
                const SizedBox(height: 20),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      height: 68,
                      width: 68,
                      child: CircularProgressIndicator(
                        value: (rideProvider.countdown / 20.0).clamp(0.0, 1.0),
                        strokeWidth: 6,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          rideProvider.countdown <= 5
                              ? Colors.redAccent
                              : (rideProvider.countdown <= 10
                                  ? Colors.orangeAccent
                                  : const Color(0xFF10B981)),
                        ),
                        backgroundColor: Colors.grey.shade300,
                      ),
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${rideProvider.countdown}s',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: rideProvider.countdown <= 5
                                    ? Colors.redAccent
                                    : null,
                              ),
                        ),
                        const Text(
                          'to accept',
                          style: TextStyle(fontSize: 10, color: Colors.grey),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 22),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: showPassDialog,
                        icon: const Icon(Icons.close_rounded, color: Colors.redAccent),
                        label: const Text(
                          'Pass',
                          style: TextStyle(
                            color: Colors.redAccent,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.redAccent, width: 1.5),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: handleAccept,
                        icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
                        label: const Text(
                          'Accept Ride',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
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

