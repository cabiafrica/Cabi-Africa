import '../theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Modal dialog presented to the passenger when matched with an out-of-radius driver.
/// Requires explicit passenger consent to wait for the estimated arrival time,
/// while guaranteeing zero extra charges to the passenger.
class ExtendedPickupConsentModal extends StatelessWidget {
  final double distanceKm;
  final int estimatedArrivalMinutes;
  final VoidCallback onConsent;
  final VoidCallback onDecline;

  const ExtendedPickupConsentModal({
    super.key,
    required this.distanceKm,
    required this.estimatedArrivalMinutes,
    required this.onConsent,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final goldColor = isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze;
    final surfaceBg = isDark ? const Color(0xFF181818) : AppTheme.porcelainSurface;
    final cardBg = isDark ? const Color(0xFF222222) : AppTheme.porcelainSurfaceContainer;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final textDim = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7);
    final outline = isDark ? Colors.white12 : AppTheme.porcelainOutline;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: surfaceBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(
          color: goldColor.withValues(alpha: 0.3),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.08),
            blurRadius: 24,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Drag Handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: outline,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header Icon & Title
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: goldColor.withValues(alpha: 0.15),
              border: Border.all(color: goldColor, width: 1.5),
            ),
            child: Center(
              child: Icon(Icons.schedule_rounded, color: goldColor, size: 28),
            ),
          ),
          const SizedBox(height: 14),

          Text(
            'Driver Coming From Afar',
            style: GoogleFonts.outfit(
              color: textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Your driver is traveling from outside their standard pickup area to reach you.',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              color: textSecondary,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 18),

          // Distance & ETA Highlight Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: outline),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text(
                      '${distanceKm.toStringAsFixed(1)} KM',
                      style: GoogleFonts.outfit(
                        color: goldColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    Text(
                      'Pickup Distance',
                      style: GoogleFonts.outfit(color: textDim, fontSize: 11),
                    ),
                  ],
                ),
                Container(width: 1, height: 32, color: outline),
                Column(
                  children: [
                    Text(
                      '~$estimatedArrivalMinutes MINS',
                      style: GoogleFonts.outfit(
                        color: textPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    Text(
                      'Expected Wait Time',
                      style: GoogleFonts.outfit(color: textDim, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Zero Extra Charge Assurance Box
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: const Color(0xFF10B981).withValues(alpha: 0.35),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'No Extra Fee: Standard fare applies. Cabi compensates the driver for the extra distance.',
                    style: GoogleFonts.outfit(
                      color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF065F46),
                      fontSize: 11.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Passenger-Driver Communication Prompt
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.forum_outlined, color: textSecondary, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Communication is encouraged: call or message your driver to coordinate your pickup spot.',
                    style: GoogleFonts.outfit(
                      color: textSecondary,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          // Primary Consent Button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: onConsent,
              style: ElevatedButton.styleFrom(
                backgroundColor: goldColor,
                foregroundColor: isDark ? Colors.black : Colors.white,
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: Text(
                'I AGREE TO WAIT (~$estimatedArrivalMinutes MINS)',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 13.5,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Secondary Decline Button
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: onDecline,
              child: Text(
                'Find Closer Driver / Cancel',
                style: GoogleFonts.outfit(
                  color: textDim,
                  fontSize: 13,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
