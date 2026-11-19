import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/screens/sos_alert_screen.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:geolocator/geolocator.dart';
import '../services/sos_service.dart';

class SosButton extends StatefulWidget {
  final VoidCallback? onTriggered;
  final VoidCallback? onDistressSignal;
  final VoidCallback? onEmergencyParams;
  final double size;

  const SosButton({
    super.key,
    this.onTriggered,
    this.onDistressSignal,
    this.onEmergencyParams,
    this.size = 50.0,
  });

  @override
  State<SosButton> createState() => _SosButtonState();
}

class _SosButtonState extends State<SosButton> {
  void _handleTap() {
    if (widget.onTriggered != null) {
      widget.onTriggered!();
      return;
    }
    _showEmergencySafetyModal(context);
  }

  void _showEmergencySafetyModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        padding: EdgeInsets.fromLTRB(
          24,
          20,
          24,
          MediaQuery.of(ctx).padding.bottom + 20,
        ),
        decoration: BoxDecoration(
          color: const Color(0xFF161616),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(
            color: AppTheme.errorRed.withValues(alpha: 0.4),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: AppTheme.errorRed.withValues(alpha: 0.2),
              blurRadius: 30,
              offset: const Offset(0, -6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.errorRed.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppTheme.errorRed.withValues(alpha: 0.5),
                  width: 2,
                ),
              ),
              child: const Icon(
                Icons.emergency_rounded,
                color: AppTheme.errorRed,
                size: 36,
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'EMERGENCY SOS DISPATCH',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Are you in immediate danger? Cabi Africa Safety & Response Operations Center is on standby 24/7.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            // Primary Emergency Alert Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  Navigator.pop(ctx);
                  widget.onDistressSignal?.call();
                  try {
                    Position? position;
                    try {
                      position = await Geolocator.getCurrentPosition(
                        desiredAccuracy: LocationAccuracy.high,
                        timeLimit: const Duration(seconds: 5),
                      );
                    } catch (_) {}

                    position ??= Position(
                      latitude: -1.2921,
                      longitude: 36.8219,
                      timestamp: DateTime.now(),
                      accuracy: 100.0,
                      altitude: 1795.0,
                      altitudeAccuracy: 10.0,
                      heading: 0.0,
                      headingAccuracy: 0.0,
                      speed: 0.0,
                      speedAccuracy: 0.0,
                    );

                    final res = await SosService().activateSos('UNASSIGNED', {
                      'lat': position.latitude,
                      'lng': position.longitude,
                    });

                    if (context.mounted) {
                      _showDistressActiveDialog(context, res);
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('⚠️ Distress Broadcast Error: $e'),
                          backgroundColor: AppTheme.errorRed,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    }
                  }
                },
                icon: const Icon(Icons.shield_rounded, color: Colors.white, size: 20),
                label: const Text(
                  'BROADCAST DISTRESS ALERT',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.0,
                    fontSize: 14,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.errorRed,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 4,
                  shadowColor: AppTheme.errorRed.withValues(alpha: 0.5),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Call Police Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  Navigator.pop(ctx);
                  final Uri phoneUri = Uri(scheme: 'tel', path: '999');
                  if (await canLaunchUrl(phoneUri)) {
                    await launchUrl(phoneUri);
                  }
                },
                icon: const Icon(Icons.phone_in_talk_rounded, color: Colors.white, size: 18),
                label: const Text(
                  'CALL POLICE (999 / 112)',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 13.5,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                'Cancel / False Alarm',
                style: TextStyle(
                  color: Colors.grey.shade400,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDistressActiveDialog(BuildContext context, DriverSosActivationResult res) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dCtx) => AlertDialog(
        backgroundColor: const Color(0xFF161616),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppTheme.errorRed, width: 2),
        ),
        title: Row(
          children: const [
            Icon(Icons.shield_rounded, color: AppTheme.errorRed, size: 28),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'DISTRESS BEACON ENGAGED',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.errorRed.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'OB REF: ${res.obNumber}',
                style: const TextStyle(color: AppTheme.errorRed, fontWeight: FontWeight.w900, fontSize: 13),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Universal Proximity Mesh broadcast to ${res.notifiedCaptainsCount} nearby Captains and Safety Command Center.',
              style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 10),
            Text(
              '⚠️ KES ${res.distressFeeBilled} emergency distress fee billed with negative balance allowance. You may submit a pardon request for Senior Official waiver.',
              style: const TextStyle(color: Colors.orangeAccent, fontSize: 12, height: 1.3),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(dCtx);
              _showPardonRequestDialog(context, res.alertId);
            },
            child: const Text('Request Fee Pardon', style: TextStyle(color: Colors.orangeAccent)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(dCtx),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
            child: const Text('Acknowledged / Stand Down', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showPardonRequestDialog(BuildContext context, String alertId) {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (pCtx) => AlertDialog(
        backgroundColor: const Color(0xFF161616),
        title: const Text('Request Distress Fee Waiver', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Explain the nature of the emergency for Senior Cabi Distress Official review:',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: 'e.g. Critical vehicle assault, violent robbery, immediate medical hazard...',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 12),
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(pCtx), child: const Text('Cancel', style: TextStyle(color: Colors.white60))),
          ElevatedButton(
            onPressed: () async {
              if (reasonController.text.trim().isEmpty) return;
              Navigator.pop(pCtx);
              try {
                final result = await SosService().requestPardon(alertId, reasonController.text.trim());
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(result['message'] ?? 'Pardon request submitted for official review.'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Could not submit pardon request: $e')),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
            child: const Text('Submit Request', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      child: ClipOval(
        child: Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [
                Color(0xFFEF4444),
                Color(0xFF991B1B),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.95),
              width: 1.8,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFDC2626).withValues(alpha: 0.45),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.shield_rounded,
                  color: Colors.white,
                  size: 14,
                ),
                SizedBox(height: 1),
                Text(
                  'SOS',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                    height: 1.0,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
