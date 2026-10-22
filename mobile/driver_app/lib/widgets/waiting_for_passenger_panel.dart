import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:driver_app/theme/app_theme.dart';
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
        correctPin: '4821',
        onPinVerified: onTripStarted,
      ),
    );
  }

  void _showPassengerProfile(BuildContext context) {
    final passengerName =
        request['passenger'] ?? request['passengerName'] ?? 'Passenger';
    final rating = request['passengerRating'] ?? '4.9';
    final totalTrips = request['totalTrips'] ?? '42';

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFF111113),
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(
              color: AppTheme.primaryColor.withValues(alpha: 0.2),
              width: 1,
            ),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              // Avatar
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border:
                      Border.all(color: AppTheme.primaryColor, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.3),
                      blurRadius: 14,
                    ),
                  ],
                ),
                child: const CircleAvatar(
                  radius: 40,
                  backgroundColor: Color(0xFF1E1E22),
                  child: Icon(Icons.person, size: 40, color: Colors.white54),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                passengerName,
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              // Stats row
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _ProfileStat(
                    icon: Icons.star_rounded,
                    value: '$rating',
                    label: 'Rating',
                    color: AppTheme.primaryColor,
                  ),
                  Container(
                    width: 1,
                    height: 30,
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    color: Colors.white12,
                  ),
                  _ProfileStat(
                    icon: Icons.directions_car_rounded,
                    value: '$totalTrips',
                    label: 'Trips',
                    color: AppTheme.successGreen,
                  ),
                ],
              ),
              const SizedBox(height: 18),
              const Divider(color: Colors.white10),
              const SizedBox(height: 14),
              Text(
                'COMPLIMENTS',
                style: GoogleFonts.outfit(
                  color: Colors.white38,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  _Compliment('👍  Polite'),
                  _Compliment('⏰  Punctual'),
                  _Compliment('🎵  Great Music Taste'),
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
    final passengerName =
        request['passenger'] ?? request['passengerName'] ?? 'Passenger';
    final phone = request['phone'] ?? request['passengerPhone'] ?? '0700123456';
    final pickupAddress =
        request['pickupAddress'] ?? request['pickup'] ?? 'Pickup Location';

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 16),
        decoration: BoxDecoration(
          color: const Color(0xFF0F0F11),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: AppTheme.primaryColor.withValues(alpha: 0.22),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.65),
              blurRadius: 28,
              offset: const Offset(0, -4),
            ),
            BoxShadow(
              color: AppTheme.primaryColor.withValues(alpha: 0.06),
              blurRadius: 20,
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // ── Status Header ──
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.location_on_rounded,
                      color: AppTheme.primaryColor,
                      size: 14,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'ARRIVED AT PICKUP',
                    style: GoogleFonts.outfit(
                      color: AppTheme.primaryColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const Spacer(),
                  // Pulsing dot
                  _PulseIndicator(),
                ],
              ),

              const SizedBox(height: 14),
              const Divider(color: Colors.white10, height: 1),
              const SizedBox(height: 14),

              // ── Passenger Info ──
              GestureDetector(
                onTap: () => _showPassengerProfile(context),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppTheme.primaryColor.withValues(alpha: 0.4),
                          width: 1.5,
                        ),
                      ),
                      child: const CircleAvatar(
                        radius: 22,
                        backgroundColor: Color(0xFF1E1E22),
                        child: Icon(Icons.person,
                            size: 24, color: Colors.white54),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PASSENGER',
                            style: GoogleFonts.outfit(
                              color: Colors.white38,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Row(
                            children: [
                              Text(
                                passengerName,
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.info_outline_rounded,
                                  size: 14, color: Colors.white30),
                            ],
                          ),
                          Text(
                            pickupAddress,
                            style: GoogleFonts.outfit(
                              color: Colors.white38,
                              fontSize: 11,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    // Rating badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: AppTheme.primaryColor.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star_rounded,
                              color: AppTheme.primaryColor, size: 13),
                          const SizedBox(width: 3),
                          Text(
                            '${request['passengerRating'] ?? '4.9'}',
                            style: GoogleFonts.outfit(
                              color: AppTheme.primaryColor,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Communication buttons ──
              Row(
                children: [
                  Expanded(
                    child: _ActionButton(
                      icon: Icons.call_rounded,
                      label: 'Call',
                      onTap: () => _makePhoneCall(phone),
                      color: AppTheme.successGreen,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _ActionButton(
                      icon: Icons.chat_bubble_rounded,
                      label: 'Message',
                      onTap: null,
                      color: const Color(0xFF3B82F6),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // ── Start Trip button ──
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryColor, Color(0xFFFFDF00)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.4),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: () => _showPinDialog(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  icon: const Icon(Icons.lock_open_rounded,
                      color: Colors.black, size: 18),
                  label: Text(
                    'ENTER PIN TO START TRIP',
                    style: GoogleFonts.outfit(
                      color: Colors.black,
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Pulsing activity indicator ───────────────────────────────────────────────
class _PulseIndicator extends StatefulWidget {
  @override
  State<_PulseIndicator> createState() => _PulseIndicatorState();
}

class _PulseIndicatorState extends State<_PulseIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppTheme.primaryColor,
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor
                  .withValues(alpha: 0.3 + _ctrl.value * 0.5),
              blurRadius: 8,
              spreadRadius: 1,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Action button ────────────────────────────────────────────────────────────
class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Color color;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 17),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.outfit(
                color: color,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Profile stat ─────────────────────────────────────────────────────────────
class _ProfileStat extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _ProfileStat({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(value,
            style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold)),
        Text(label,
            style: TextStyle(color: Colors.white38, fontSize: 11)),
      ],
    );
  }
}

// ── Compliment chip ──────────────────────────────────────────────────────────
class _Compliment extends StatelessWidget {
  final String label;
  const _Compliment(this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white12),
      ),
      child: Text(label,
          style: const TextStyle(color: Colors.white70, fontSize: 12)),
    );
  }
}
