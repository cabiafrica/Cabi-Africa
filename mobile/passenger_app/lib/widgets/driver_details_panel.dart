import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:core_ui/core_ui.dart';
import '../services/safety_service.dart';

class DriverDetailsPanel extends StatelessWidget {
  final String driverName;
  final String carModel;
  final String licensePlate;
  final String eta;
  final String? vehicleColor;
  final String? profilePictureUrl;

  const DriverDetailsPanel({
    super.key,
    required this.driverName,
    required this.carModel,
    required this.licensePlate,
    required this.eta,
    this.vehicleColor,
    this.profilePictureUrl,
  });

  Future<void> _handleSOS(BuildContext context) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Emergency SOS'),
        content: const Text('Call Emergency Services (911)?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Call 911'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final Uri launchUri = Uri(scheme: 'tel', path: '911');
      try {
        if (await canLaunchUrl(launchUri)) {
          await launchUrl(launchUri);
          await SafetyService().logEmergencyEvent();
        } else {
          throw 'Could not launch';
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not launch emergency call.')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorText = (vehicleColor != null && vehicleColor!.isNotEmpty)
        ? '$vehicleColor '
        : '';

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              ProfileAvatarBadge(
                imageUrl: profilePictureUrl,
                name: driverName,
                radius: 24,
                borderColor: const Color(0xFFD4AF37),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      driverName,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade100,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(
                                color: Colors.amber.shade700, width: 0.8),
                          ),
                          child: Text(
                            licensePlate,
                            style: TextStyle(
                              color: Colors.amber.shade900,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '$colorText• $carModel',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.black54,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    eta,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const Text('ETA', style: TextStyle(fontSize: 12)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _handleSOS(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade50,
                foregroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              icon: const Icon(Icons.warning_amber_rounded),
              label: const Text('SOS - Emergency Call'),
            ),
          ),
        ],
      ),
    );
  }
}
