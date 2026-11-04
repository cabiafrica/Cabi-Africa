import '../theme/app_theme.dart';
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final surfaceBg = isDark ? const Color(0xFF16161A) : AppTheme.porcelainSurface;
    final outline = isDark ? Colors.white12 : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;

    final colorText = (vehicleColor != null && vehicleColor!.isNotEmpty)
        ? '$vehicleColor '
        : '';

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: surfaceBg,
        border: Border(top: BorderSide(color: outline, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.08),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
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
                borderColor: accent,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      driverName,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: textPrimary,
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
                            style: TextStyle(
                              color: textSecondary,
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
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: accent,
                    ),
                  ),
                  Text('ETA', style: TextStyle(fontSize: 12, color: textSecondary)),
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
                backgroundColor: const Color(0xFFEF4444).withValues(alpha: isDark ? 0.15 : 0.08),
                foregroundColor: const Color(0xFFEF4444),
                side: BorderSide(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
