import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/providers/active_ride_provider.dart';
import 'package:driver_app/providers/sos_provider.dart';
import 'package:driver_app/services/sos_service.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content:
                    Text('Trip completed. Waiting for passenger payment...')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to complete trip: $e')),
          );
        }
      }
    }

    Future<void> handleSOS() async {
      final bool? confirmed = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF1A0505),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFFEF4444), width: 1),
          ),
          title: Row(
            children: [
              const Icon(Icons.warning_amber_rounded,
                  color: Color(0xFFEF4444), size: 28),
              const SizedBox(width: 10),
              Text('Confirm SOS',
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  )),
            ],
          ),
          content: Text(
            'Are you sure you want to activate the emergency SOS alert? This will notify Cabi dispatch and emergency contacts immediately.',
            style: GoogleFonts.inter(color: Colors.white70, fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text('Cancel',
                  style: GoogleFonts.inter(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () => Navigator.of(context).pop(true),
              child: Text('ACTIVATE SOS',
                  style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );

      if (confirmed != true) return;

      var microphoneStatus = await Permission.microphone.request();
      var locationStatus = await Permission.location.request();

      if (microphoneStatus.isDenied || locationStatus.isDenied) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text(
                  'Microphone and Location permissions are required for SOS.')));
        }
        return;
      }

      try {
        final position = await Geolocator.getCurrentPosition();
        final sosService = this.sosService ?? SosService();
        await sosService.activateSos(rideData['rideId'], {
          'lat': position.latitude,
          'lng': position.longitude,
        });
        sosProvider.activateSOS();
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('SOS Activation Failed: $e')));
        }
      }
    }

    final destination = rideData['destinationAddress'] ??
        rideData['dropoffAddress'] ??
        'Destination';
    final passengerName = rideData['passengerName'] ??
        rideData['passenger']?['fullName'] ??
        'Passenger';

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
            color: AppTheme.primaryColor.withValues(alpha: 0.25),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.65),
              blurRadius: 24,
              offset: const Offset(0, -4),
            ),
            BoxShadow(
              color: AppTheme.primaryColor.withValues(alpha: 0.07),
              blurRadius: 20,
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Trip Status Header ──
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.directions_car_rounded,
                      color: AppTheme.successGreen,
                      size: 14,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'TRIP IN PROGRESS',
                    style: GoogleFonts.inter(
                      color: AppTheme.successGreen,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(color: Colors.white10, height: 1),
              const SizedBox(height: 12),

              // ── Destination ──
              Row(
                children: [
                  const Icon(Icons.location_on_rounded,
                      color: Color(0xFFEF4444), size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DESTINATION',
                          style: GoogleFonts.inter(
                            color: const Color(0xFFEF4444),
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          destination,
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.person_rounded,
                    color: Colors.white.withValues(alpha: 0.5),
                    size: 14,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    passengerName,
                    style: GoogleFonts.inter(
                      color: Colors.white70,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // ── Action Buttons ──
              Row(
                children: [
                  // SOS Button
                  GestureDetector(
                    onLongPress: handleSOS,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFEF4444).withValues(alpha: 0.4),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFEF4444)
                                .withValues(alpha: 0.2),
                            blurRadius: 12,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.sos_rounded,
                        color: Color(0xFFEF4444),
                        size: 24,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Complete Trip Button
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: const LinearGradient(
                          colors: [
                            AppTheme.primaryColor,
                            Color(0xFFFFDF00),
                          ],
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
                        onPressed: handleCompleteTrip,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        icon: const Icon(Icons.check_circle_rounded,
                            color: Colors.black, size: 18),
                        label: Text(
                          'Complete Trip',
                          style: GoogleFonts.inter(
                            color: Colors.black,
                            fontWeight: FontWeight.w900,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Center(
                child: Text(
                  'Hold SOS button for 2s in emergency',
                  style: GoogleFonts.inter(
                    color: Colors.white24,
                    fontSize: 10,
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
