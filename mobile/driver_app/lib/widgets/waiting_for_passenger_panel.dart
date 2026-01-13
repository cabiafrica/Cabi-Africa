import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'pin_entry_dialog.dart';

class WaitingForPassengerPanel extends StatelessWidget {
  final Map<String, dynamic> request;
  final VoidCallback onTripStarted;

  const WaitingForPassengerPanel({
    super.key,
    required this.request,
    required this.onTripStarted,
  });

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  void _showPinDialog(BuildContext context) {
      showDialog(
          context: context,
          builder: (context) => PinEntryDialog(
              correctPin: '4821', // Mock correct PIN matching passenger app
              onPinVerified: onTripStarted,
          ),
      );
  }

  void _showPassengerProfile(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircleAvatar(radius: 40, child: Icon(Icons.person, size: 40)),
              const SizedBox(height: 16),
              Text(request['passenger'] ?? 'Passenger', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 20),
                  const SizedBox(width: 4),
                  Text('${request['passengerRating'] ?? '4.9'}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(width: 16),
                  const Icon(Icons.directions_car, color: Colors.grey, size: 20),
                  const SizedBox(width: 4),
                  Text('${request['totalTrips'] ?? '42'} Trips', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              const Text('Compliments', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Wrap(
                spacing: 8,
                children: [
                  Chip(avatar: Icon(Icons.thumb_up, size: 16), label: Text('Polite')),
                  Chip(avatar: Icon(Icons.access_time, size: 16), label: Text('Punctual')),
                  Chip(avatar: Icon(Icons.music_note, size: 16), label: Text('Great Music Taste')),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Card(
        margin: const EdgeInsets.all(16),
        elevation: 8,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                        InkWell(
                          onTap: () => _showPassengerProfile(context),
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                  const Text('Passenger Arriving...', style: TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold)),
                                  Row(
                                    children: [
                                      Text(request['passenger'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                                      const SizedBox(width: 8),
                                      const Icon(Icons.info_outline, size: 18, color: Colors.grey),
                                    ],
                                  ),
                              ],
                          ),
                        ),
                        InkWell(
                            onTap: () => _showPassengerProfile(context),
                            child: const CircleAvatar(
                                radius: 24,
                                child: Icon(Icons.person, size: 28),
                            ),
                        )
                    ],
                ),
                const SizedBox(height: 16),
                Row(
                    children: [
                        Expanded(
                            child: OutlinedButton.icon(
                                onPressed: () => _makePhoneCall('0700123456'),
                                icon: const Icon(Icons.call),
                                label: const Text('Call'),
                            ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                            child: OutlinedButton(
                                onPressed: null, // Chat implementation skipped for now
                                child: Text('Chat'),
                            ),
                        ),
                    ],
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 16),
                ElevatedButton(
                    onPressed: () => _showPinDialog(context),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('START TRIP'),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
