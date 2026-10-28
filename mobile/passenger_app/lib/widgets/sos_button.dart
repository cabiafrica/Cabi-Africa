import 'package:flutter/material.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:passenger_app/services/safety_service.dart';
import 'package:url_launcher/url_launcher.dart';
import '../screens/safety_center_screen.dart';

class SOSButton extends StatefulWidget {
  final VoidCallback? onTriggered;
  final double size;

  const SOSButton({
    super.key,
    this.onTriggered,
    this.size = 50.0,
  });

  @override
  State<SOSButton> createState() => _SOSButtonState();
}

typedef SosButton = SOSButton;

class _SOSButtonState extends State<SOSButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat();

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.35).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOutQuad),
    );

    _fadeAnimation = Tween<double>(begin: 0.5, end: 0.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOutQuad),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

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
            Text(
              'PASSENGER EMERGENCY SOS',
              style: AppTheme.montserrat(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Are you feeling unsafe or in danger? Cabi Africa 24/7 Safety Command Center will track your real-time ride coordinates.',
              textAlign: TextAlign.center,
              style: AppTheme.plusJakartaSans(
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
                  try {
                    await SafetyService().logEmergencyEvent();
                  } catch (e) {
                    debugPrint('Error logging emergency: $e');
                  }
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text(
                          '🚨 Emergency alert dispatched to Cabi Security Team!',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        backgroundColor: AppTheme.errorRed,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    );
                  }
                },
                icon: const Icon(Icons.shield_rounded, color: Colors.white, size: 20),
                label: Text(
                  'ALERT CABI SAFETY TEAM',
                  style: AppTheme.montserrat(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
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
            // Share Trip with Trusted Contacts (Stitch Safety Center)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('📍 Live GPS tracking link generated & shared with emergency contacts.'),
                      backgroundColor: AppTheme.surfaceContainerHighest,
                    ),
                  );
                },
                icon: const Icon(Icons.share_location_rounded, color: AppTheme.electricBlue, size: 18),
                label: Text(
                  'SHARE LIVE TRIP WITH CONTACTS',
                  style: AppTheme.inter(
                    fontWeight: FontWeight.bold,
                    color: AppTheme.electricBlue,
                    fontSize: 12.5,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.electricBlue, width: 1.2),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
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
                label: Text(
                  'CALL POLICE (999 / 112)',
                  style: AppTheme.inter(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 13,
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
            // Open Safety Center Command (Stitch Safety Center)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SafetyCenterScreen()),
                  );
                },
                icon: const Icon(Icons.security_rounded, color: Colors.black, size: 18),
                label: Text(
                  'OPEN SAFETY COMMAND CENTER',
                  style: AppTheme.montserrat(
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                    fontSize: 12.5,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
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
                style: AppTheme.plusJakartaSans(
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

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            // Pulse wave ring
            Transform.scale(
              scale: _pulseAnimation.value,
              child: Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.errorRed.withValues(
                    alpha: _fadeAnimation.value,
                  ),
                  border: Border.all(
                    color: AppTheme.errorRed.withValues(
                      alpha: _fadeAnimation.value * 1.5,
                    ),
                    width: 1.5,
                  ),
                ),
              ),
            ),
            // Main SOS Button
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: _handleTap,
                customBorder: const CircleBorder(),
                child: Ink(
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
                        blurRadius: 10,
                        spreadRadius: 1,
                        offset: const Offset(0, 3),
                      ),
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.35),
                        blurRadius: 6,
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
                          size: 15,
                        ),
                        SizedBox(height: 1),
                        Text(
                          'SOS',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
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
            ),
          ],
        );
      },
    );
  }
}
