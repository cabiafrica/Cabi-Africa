import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class TripInProgressPanel extends StatelessWidget {
  final Map<String, dynamic> rideDetails;
  final VoidCallback onEndTrip;
  final VoidCallback onSOS;

  const TripInProgressPanel({
    super.key,
    required this.rideDetails,
    required this.onEndTrip,
    required this.onSOS,
  });

  // Helper to launch URLs
  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    final destinationAddress =
        rideDetails['destination'] ?? 'Unknown Destination';

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Card(
        margin: const EdgeInsets.all(16.0),
        elevation: 8,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Trip in Progress',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              if (rideDetails['bookingType'] != null && rideDetails['bookingType'] != 'ONE_WAY')
                Container(
                  margin: const EdgeInsets.only(top: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'TYPE: ${rideDetails['bookingType']}',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
                  ),
                ),
              const SizedBox(height: 8),
              Text(
                'Destination: $destinationAddress',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  IconButton(
                    icon: const Icon(Icons.call),
                    onPressed: () => _launchUrl('tel:+1234567890'),
                    tooltip: 'Call Passenger',
                  ),
                  IconButton(
                    icon: const Icon(Icons.message),
                    onPressed: () => _launchUrl('sms:+1234567890'),
                    tooltip: 'Chat with Passenger',
                  ),
                  IconButton(
                    icon: const Icon(Icons.sos),
                    onPressed: onSOS,
                    tooltip: 'Emergency SOS',
                    color: Colors.red,
                  ),
                  // Speed Limit (Story 56.5)
                  Column(
                     mainAxisSize: MainAxisSize.min,
                     children: [
                        Container(
                           width: 40,
                           height: 40,
                           alignment: Alignment.center,
                           decoration: BoxDecoration(
                             shape: BoxShape.circle,
                             border: Border.all(color: Colors.red, width: 4), // Mock Red for speeding
                           ),
                           child: const Text('50', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                        const Text('LIMIT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                     ],
                  ),
                ],
              ),
              if (rideDetails['kerbsideColor'] != null)
                 Container(
                   margin: const EdgeInsets.symmetric(vertical: 16),
                   padding: const EdgeInsets.all(12),
                   color: Colors.yellow.shade100,
                   child: Row(
                     children: [
                       const Icon(Icons.airport_shuttle, color: Colors.orange),
                       const SizedBox(width: 12),
                       Expanded(
                         child: Text(
                           'Look for passenger holding flashing ${rideDetails['kerbsideColor']} screen!',
                           style: const TextStyle(fontWeight: FontWeight.bold),
                         ),
                       ),
                     ],
                   ),
                 ),
              const Divider(height: 24),
              ElevatedButton(
                onPressed: onEndTrip,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'END TRIP',
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
