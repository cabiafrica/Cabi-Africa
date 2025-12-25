import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/providers/active_ride_provider.dart';
import 'package:driver_app/providers/sos_provider.dart';
import 'package:driver_app/services/sos_service.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class InTripPanel extends StatelessWidget {
  final Map<String, dynamic> rideData;
  final RideService? rideService;
  final SosService? sosService;

  const InTripPanel({
    super.key,
    required this.rideData,
    this.rideService,
    this.sosService,
  });

  @override
  Widget build(BuildContext context) {
    final rideService = this.rideService ?? RideService();
    final activeRideProvider =
        Provider.of<ActiveRideProvider>(context, listen: false);
    final sosProvider = Provider.of<SOSProvider>(context, listen: false);

    void handleCompleteTrip() async {
      try {
        await rideService.completeTrip(rideData['rideId']);
        activeRideProvider.updateRideStatus('COMPLETED');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content:
                  Text('Trip completed. Waiting for passenger payment...')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to complete trip: $e')),
        );
      }
    }

    Future<void> handleSOS() async {
      // 1. Confirmation Dialog
      final bool? confirmed = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Confirm SOS'),
          content: const Text(
              'Are you sure you want to activate the emergency SOS alert?'),
          actions: [
            TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel')),
            TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('ACTIVATE')),
          ],
        ),
      );

      if (confirmed != true) return;

      // 2. Permissions
      var microphoneStatus = await Permission.microphone.request();
      var locationStatus = await Permission.location.request();

      if (microphoneStatus.isDenied || locationStatus.isDenied) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text(
                'Microphone and Location permissions are required for SOS.')));
        return;
      }

      // 3. Activate
      try {
        final position = await Geolocator.getCurrentPosition();
        final sosService = this.sosService ?? SosService();
        await sosService.activateSos(rideData['rideId'], {
          'lat': position.latitude,
          'lng': position.longitude,
        });

        // This would be where the audio streaming logic is initiated
        // final audioStream = await AudioStreamService.instance.startStreaming();
        // final channel = sosService.connectAudioStream(rideData['rideId']);
        // audioStream.listen((data) => channel.sink.add(data));

        sosProvider.activateSOS();
      } catch (e) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('SOS Activation Failed: $e')));
      }
    }

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Card(
        margin: const EdgeInsets.all(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Trip to: ${rideData['destinationAddress']}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text('Passenger: ${rideData['passengerName']}'),
              const SizedBox(height: 24),
              Row(
                children: [
                  GestureDetector(
                    onLongPress: handleSOS,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child:
                          const Icon(Icons.sos, color: Colors.white, size: 32),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: handleCompleteTrip,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Complete Trip'),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
