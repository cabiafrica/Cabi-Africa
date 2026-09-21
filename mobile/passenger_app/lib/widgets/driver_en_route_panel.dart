import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class DriverEnRoutePanel extends StatelessWidget {
  final Map<String, dynamic> rideDetails;
  final VoidCallback onArrived;

  const DriverEnRoutePanel({
    super.key,
    required this.rideDetails,
    required this.onArrived,
  });

  // Helper to launch URLs
  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      // In a real app, show a snackbar or dialog
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Dummy data for passenger name and ETA
    final passengerName = rideDetails['passengerName'] ?? 'Passenger';
    final eta = rideDetails['eta'] ?? 5;

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
                'Picking up $passengerName',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Arriving in $eta mins',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Theme.of(context).primaryColor,
                ),
              ),
              const Divider(height: 24),
              if (rideDetails['isExtendedPickup'] == true) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.bolt_rounded, color: Color(0xFFD4AF37), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Driver is coming from afar (~$eta mins). Call or message to coordinate pickup spot.',
                          style: const TextStyle(
                            color: Color(0xFFD4AF37),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  IconButton(
                    icon: const Icon(Icons.call),
                    onPressed: () {
                      final phone = rideDetails['passengerPhone'] ?? '';
                      if (phone.isNotEmpty) _launchUrl('tel:$phone');
                    },
                    tooltip: 'Call Passenger',
                  ),
                  IconButton(
                    icon: const Icon(Icons.message),
                    onPressed: () {
                      final phone = rideDetails['passengerPhone'] ?? '';
                      if (phone.isNotEmpty) _launchUrl('sms:$phone');
                    },
                    tooltip: 'Chat with Passenger',
                  ),
                  IconButton(
                    icon: const Icon(Icons.navigation),
                    onPressed: () {
                      // In a real app, this would open Google/Apple Maps with directions
                    },
                    tooltip: 'Navigate',
                  ),
                ],
              ),
              const Divider(height: 24),
              ElevatedButton(
                onPressed: onArrived,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'I HAVE ARRIVED',
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
