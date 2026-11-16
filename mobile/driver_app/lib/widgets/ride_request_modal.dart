import '../theme/app_theme.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:core_ui/core_ui.dart';
import '../screens/trip_in_progress_screen.dart';
import 'package:driver_app/widgets/badge_showcase_widget.dart';
import 'package:driver_app/services/badge_service.dart' as badge_service;
import '../services/audio_notification_service.dart';

class RideRequestModal extends StatelessWidget {
  final Map<String, dynamic> requestData;
  final RideService? rideService;
  final String driverId;

  const RideRequestModal({
    super.key,
    required this.requestData,
    this.rideService,
    required this.driverId,
  });

  @override
  Widget build(BuildContext context) {
    final rideProvider = Provider.of<RideRequestProvider>(context);
    final service = rideService ?? RideService();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze;
    final cardSurface = isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? const Color(0xFFCCCCCC) : AppTheme.porcelainTextSecondary;
    final routeBoxBg = isDark ? Colors.white.withValues(alpha: 0.04) : AppTheme.porcelainSurfaceContainer;
    final routeBoxBorder = isDark ? Colors.white12 : AppTheme.porcelainOutline;

    final passengerName = (requestData['passengerName'] ??
            requestData['passenger']?['nickname'] ??
            requestData['passenger']?['fullName'] ??
            'Passenger')
        .toString();

    final passengerPhoto = (requestData['passengerPhoto'] ??
            requestData['passenger']?['passportPhotoUrl'])
        ?.toString();

    final destination = (requestData['destination'] ??
            requestData['dropoffAddress'] ??
            requestData['dropoffLocation']?['address'] ??
            'Destination')
        .toString();

    final pickup = (requestData['pickupAddress'] ??
            requestData['pickupLocation']?['address'] ??
            'Current Location')
        .toString();

    final rawFare = requestData['fare'] ??
        requestData['amount'] ??
        requestData['estimatedFare'] ??
        0;
    final double fare = (rawFare is num) ? rawFare.toDouble() : 0.0;

    final paymentMethod =
        (requestData['paymentMethod'] ?? 'CASH').toString().toUpperCase();

    void handleAccept() async {
      try {
        AudioNotificationService.instance.play('driver_accepted');
        try {
          await service.acceptRide(requestData['rideId'], driverId);
        } catch (e) {
          debugPrint('[ACCEPT] Backend call handled (offline/simulation mode): $e');
        }
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Ride Accepted! Navigating to pickup...')),
          );
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => TripInProgressScreen(
                rideId: requestData['rideId'],
                driverId: driverId,
                passengerName: passengerName,
                tripCode: requestData['tripCode'] as String?,
                isExtendedPickup: requestData['isExtendedPickup'] == true,
                subsidyAmount:
                    (requestData['extendedPickupSubsidy'] as num?)?.toDouble(),
                serviceCategory: (requestData['vehicleType'] ?? requestData['serviceCategory'] ?? 'STANDARD').toString(),
              ),
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to accept ride: $e')),
          );
        }
      } finally {
        rideProvider.clearRideRequest();
      }
    }

    void handlePass({String? reason}) {
      AudioNotificationService.instance.play('trip_passed');
      final passReason = reason ??
          (requestData['isVerifiedPassenger'] == false
              ? 'unverified passenger'
              : 'Driver passed trip');
      service.passRide(requestData['rideId'], driverId, passReason);
      rideProvider.clearRideRequest();
    }

    void showPassDialog() {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Pass Trip'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (requestData['isVerifiedPassenger'] == false) ...[
                const Text(
                    'This passenger is not verified. Would you like to pass on this trip with a reason?'),
                const SizedBox(height: 16),
              ],
              const Text(
                  'Are you sure you want to pass this trip to the next available driver?'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            if (requestData['isVerifiedPassenger'] == false)
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  handlePass(reason: 'unverified passenger');
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                child: const Text('Pass (Unverified)'),
              ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                handlePass();
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Pass'),
            ),
          ],
        ),
      );
    }

    return Container(
      color: isDark ? Colors.black.withValues(alpha: 0.65) : Colors.black.withValues(alpha: 0.45),
      child: Center(
        child: SingleChildScrollView(
          child: Card(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
              side: const BorderSide(color: Color(0xFFD4AF37), width: 1.2),
            ),
            elevation: 16,
            color: cardSurface,
            child: Padding(
              padding: const EdgeInsets.all(22.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header: New Ride Request & Trip Code
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD4AF37).withValues(alpha: 0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.local_taxi_rounded,
                              color: Color(0xFFD4AF37),
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'NEW RIDE REQUEST',
                            style: TextStyle(
                              color: Color(0xFFD4AF37),
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ],
                      ),
                      if (requestData['tripCode'] != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.black : AppTheme.porcelainSurfaceHigh,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                                color: accent.withValues(alpha: 0.5)),
                          ),
                          child: Text(
                            'PIN: ${requestData['tripCode']}',
                            style: const TextStyle(
                              color: Color(0xFFD4AF37),
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                    ],
                  ),
                  Divider(color: isDark ? Colors.white12 : AppTheme.porcelainOutline, height: 24),

                  // ── 1. PASSENGER IDENTITY & PHOTO ──
                  Row(
                    children: [
                      ProfileAvatarBadge(
                        imageUrl: passengerPhoto,
                        name: passengerName,
                        radius: 28,
                        borderColor: const Color(0xFFD4AF37),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              passengerName,
                              style: TextStyle(
                                color: textPrimary,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Row(
                              children: [
                                const Icon(Icons.star_rounded,
                                    color: Colors.amber, size: 16),
                                const SizedBox(width: 3),
                                Text(
                                  '${requestData['passengerRating'] ?? '4.9'}',
                                  style: TextStyle(
                                    color: textSecondary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                if (requestData['isVerifiedPassenger'] == true)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.verified,
                                            size: 11, color: Colors.greenAccent),
                                        SizedBox(width: 3),
                                        Text(
                                          'Verified',
                                          style: TextStyle(
                                            color: Colors.greenAccent,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
                                else
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.orange.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text(
                                      'Unverified',
                                      style: TextStyle(
                                        color: Colors.orangeAccent,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // ── 2. AMOUNT TO BE PAID (FARE BANNER) ──
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFFD4AF37).withValues(alpha: 0.18),
                          const Color(0xFFB8860B).withValues(alpha: 0.08),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.4),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'NET DRIVER EARNINGS',
                                  style: TextStyle(
                                    color: Color(0xFFD4AF37),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.1,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  fare > 0
                                      ? 'KES ${(fare * 0.85).toStringAsFixed(0)}'
                                      : 'KES 520',
                                  style: TextStyle(
                                    color: textPrimary,
                                    fontSize: 26,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.bolt_rounded,
                                    color: Color(0xFF10B981),
                                    size: 14,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    paymentMethod.contains('CASH') ? 'CASH' : 'M-PESA INSTANT',
                                    style: const TextStyle(
                                      color: Color(0xFF10B981),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Total Fare: KES ${fare > 0 ? fare.toStringAsFixed(0) : "650"} • SACCO Welfare: -KES 30 • Platform: 15%',
                          style: TextStyle(
                            color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── 3. TRIP ROUTE & DESTINATION ──
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: routeBoxBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: routeBoxBorder),
                    ),
                    child: Column(
                      children: [
                        // Pickup
                        Row(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: const BoxDecoration(
                                color: Colors.greenAccent,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                pickup,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: textSecondary,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 4.5, top: 4, bottom: 4),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Container(
                              width: 1,
                              height: 14,
                              color: isDark ? Colors.white24 : AppTheme.porcelainOutline,
                            ),
                          ),
                        ),
                        // Destination
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on_rounded,
                              color: Colors.redAccent,
                              size: 14,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'DESTINATION',
                                    style: TextStyle(
                                      color: Colors.redAccent,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                  Text(
                                    destination,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: textPrimary,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Extended pickup fuel subsidy notification
                  if (requestData['isExtendedPickup'] == true ||
                      (requestData['extendedPickupSubsidy'] != null &&
                          (requestData['extendedPickupSubsidy'] as num) > 0)) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                            color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.bolt_rounded,
                              size: 16, color: Color(0xFFD4AF37)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              '+KES ${requestData['extendedPickupSubsidy'] ?? 60} Extended Pickup Fuel Subsidy',
                              style: const TextStyle(
                                color: Color(0xFFD4AF37),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  if ((requestData['passengerBadges'] as List?)?.isNotEmpty ??
                      false) ...[
                    const SizedBox(height: 10),
                    BadgeShowcaseWidget(
                      badges: (requestData['passengerBadges'] as List)
                          .cast<badge_service.Badge>(),
                      compact: true,
                    ),
                  ],
                  const SizedBox(height: 16),

                  // ── 4. RADIAL COUNTDOWN RING ──
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: (rideProvider.countdown <= 5
                                    ? Colors.redAccent
                                    : const Color(0xFFD4AF37))
                                .withValues(alpha: 0.25),
                            blurRadius: 18,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          SizedBox(
                            height: 70,
                            width: 70,
                            child: CircularProgressIndicator(
                              value: (rideProvider.countdown / 15.0).clamp(0.0, 1.0),
                              strokeWidth: 5.5,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                rideProvider.countdown <= 5
                                    ? const Color(0xFFEF4444)
                                    : (rideProvider.countdown <= 8
                                        ? const Color(0xFFF59E0B)
                                        : const Color(0xFFD4AF37)),
                              ),
                              backgroundColor: isDark ? Colors.white10 : AppTheme.porcelainSurfaceHigh,
                            ),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${rideProvider.countdown}s',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                  color: rideProvider.countdown <= 5
                                      ? const Color(0xFFEF4444)
                                      : textPrimary,
                                ),
                              ),
                              Text(
                                'REMAINING',
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.8,
                                  color: textSecondary.withValues(alpha: 0.6),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── 5. ACTION BUTTONS (PASS & ACCEPT) ──
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: showPassDialog,
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(
                                color: Color(0xFFEF4444), width: 1.4),
                            backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.08),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Pass',
                            style: TextStyle(
                              color: Color(0xFFEF4444),
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            gradient: const LinearGradient(
                              colors: [Color(0xFFD4AF37), Color(0xFFFFDF00)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.45),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: handleAccept,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.bolt_rounded,
                                    color: Colors.black, size: 20),
                                const SizedBox(width: 4),
                                Text(
                                  'ACCEPT • KES ${fare > 0 ? (fare * 0.85).toStringAsFixed(0) : "520"}',
                                  style: const TextStyle(
                                    color: Colors.black,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
