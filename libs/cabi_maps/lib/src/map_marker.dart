import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'widgets/radar_animation.dart';

/// Custom marker for Cabi map
class CabiMapMarker {
  final LatLng position;
  final Widget child;
  final double width;
  final double height;
  final VoidCallback? onTap;

  CabiMapMarker({
    required this.position,
    required this.child,
    this.width = 48.0,
    this.height = 48.0,
    this.onTap,
  });

  /// Create a professional onscreen vehicle icon with glued radar animation
  factory CabiMapMarker.driver({
    required LatLng position,
    required String driverId,
    bool isOnline = true,
    bool showRadar = false,
    double radiusKm = 5.0,
    VoidCallback? onTap,
  }) {
    final bool displayRadar = isOnline && showRadar;
    // When online with radar, marker dimensions encompass the radar (360x360) so radar moves with the car!
    final double dimension = displayRadar ? 360.0 : 48.0;

    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: dimension,
      height: dimension,
      child: displayRadar
          ? Stack(
              alignment: Alignment.center,
              clipBehavior: Clip.none,
              children: [
                IgnorePointer(
                  child: RadarAnimation(
                    isOnline: true,
                    radiusKm: radiusKm,
                  ),
                ),
                const _DriverVehicleMarker(isOnline: true),
              ],
            )
          : _DriverVehicleMarker(isOnline: isOnline),
    );
  }

  /// Create a modern passenger live location marker
  factory CabiMapMarker.passenger({
    required LatLng position,
    bool showRadar = false,
    double radiusKm = 5.0,
    String? radarLabel,
    VoidCallback? onTap,
  }) {
    final double dimension = showRadar ? 360.0 : 48.0;

    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: dimension,
      height: dimension,
      child: showRadar
          ? Stack(
              alignment: Alignment.center,
              clipBehavior: Clip.none,
              children: [
                IgnorePointer(
                  child: RadarAnimation(
                    isOnline: true,
                    radiusKm: radiusKm,
                    showTag: false,
                    label: radarLabel ?? 'SEARCHING FOR DRIVERS',
                  ),
                ),
                const _PassengerLiveMarker(),
              ],
            )
          : const _PassengerLiveMarker(),
    );
  }

  /// Create a professional map trip start location (Pickup) pin
  factory CabiMapMarker.pickup({
    required LatLng position,
    bool showRadar = false,
    double radiusKm = 5.0,
    String? radarLabel,
    VoidCallback? onTap,
  }) {
    const pinWidget = _MapPinWidget(
      primaryColor: Color(0xFF10B981),
      darkColor: Color(0xFF047857),
      icon: Icons.my_location_rounded,
      label: 'PICKUP',
    );

    if (showRadar) {
      return CabiMapMarker(
        position: position,
        onTap: onTap,
        width: 360.0,
        height: 360.0,
        child: Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            IgnorePointer(
              child: RadarAnimation(
                isOnline: true,
                radiusKm: radiusKm,
                showTag: false,
                label: radarLabel ?? 'SEARCHING FOR DRIVERS',
              ),
            ),
            pinWidget,
          ],
        ),
      );
    }

    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: 46,
      height: 56,
      child: pinWidget,
    );
  }

  /// Create a professional map trip end location (Dropoff) pin
  factory CabiMapMarker.dropoff({
    required LatLng position,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: 46,
      height: 56,
      child: const _MapPinWidget(
        primaryColor: Color(0xFFEF4444),
        darkColor: Color(0xFFB91C1C),
        icon: Icons.flag_rounded,
        label: 'DROPOFF',
      ),
    );
  }

  /// Create a custom marker with icon
  factory CabiMapMarker.custom({
    required LatLng position,
    required IconData icon,
    Color color = const Color(0xFFD4AF37),
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: 46,
      height: 46,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.35),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 22,
        ),
      ),
    );
  }

  /// Create a high-demand heatmap hotspot marker
  factory CabiMapMarker.hotspot({
    required LatLng position,
    required String name,
    required double multiplier,
    required int activeRequests,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: 160,
      height: 76,
      child: _HotspotMarkerWidget(
        name: name,
        multiplier: multiplier,
        activeRequests: activeRequests,
      ),
    );
  }
}

/// High Demand Zone Hotspot Marker Widget
class _HotspotMarkerWidget extends StatelessWidget {
  final String name;
  final double multiplier;
  final int activeRequests;

  const _HotspotMarkerWidget({
    required this.name,
    required this.multiplier,
    required this.activeRequests,
  });

  @override
  Widget build(BuildContext context) {
    const flameColor = Color(0xFFFF5722);
    const orangeGold = Color(0xFFFFA000);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E1B18), Color(0xFF2D150B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: multiplier >= 1.5 ? flameColor : orangeGold,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: (multiplier >= 1.5 ? flameColor : orangeGold).withValues(alpha: 0.4),
                blurRadius: 12,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.local_fire_department, color: flameColor, size: 14),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                        letterSpacing: 0.2,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                    decoration: BoxDecoration(
                      color: flameColor.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${multiplier.toStringAsFixed(1)}x',
                      style: const TextStyle(
                        color: Color(0xFFFFAB91),
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$activeRequests requests',
                    style: const TextStyle(
                      color: Color(0xFFD4AF37),
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        // Downward pointer arrow
        CustomPaint(
          size: const Size(10, 6),
          painter: _TriangleArrowPainter(
            color: multiplier >= 1.5 ? flameColor : orangeGold,
          ),
        ),
      ],
    );
  }
}

class _TriangleArrowPainter extends CustomPainter {
  final Color color;
  const _TriangleArrowPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Professional Onscreen Vehicle Marker with Luxury Gold Accent and Live Status Pip
class _DriverVehicleMarker extends StatelessWidget {
  final bool isOnline;

  const _DriverVehicleMarker({required this.isOnline});

  @override
  Widget build(BuildContext context) {
    const goldColor = Color(0xFFD4AF37);

    return SizedBox(
      width: 48,
      height: 48,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer ambient glow when driver is online
          if (isOnline)
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: goldColor.withValues(alpha: 0.16),
                boxShadow: [
                  BoxShadow(
                    color: goldColor.withValues(alpha: 0.35),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
            ),

          // Main vehicle badge
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: isOnline
                  ? const LinearGradient(
                      colors: [Color(0xFF282215), Color(0xFF121212)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : const LinearGradient(
                      colors: [Color(0xFF374151), Color(0xFF1F2937)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
              border: Border.all(
                color: isOnline ? goldColor : Colors.grey.shade400,
                width: 2.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.4),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Center(
              child: Icon(
                Icons.directions_car_filled_rounded,
                color: isOnline ? const Color(0xFFF3E5AB) : Colors.grey.shade400,
                size: 22,
              ),
            ),
          ),

          // GPS Online / Offline Status Dot
          Positioned(
            bottom: 2,
            right: 2,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isOnline ? const Color(0xFF10B981) : Colors.grey,
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: isOnline
                    ? [
                        BoxShadow(
                          color: const Color(0xFF10B981).withValues(alpha: 0.6),
                          blurRadius: 4,
                          spreadRadius: 1,
                        ),
                      ]
                    : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Modern Passenger Live Location Beacon Puck
class _PassengerLiveMarker extends StatelessWidget {
  const _PassengerLiveMarker();

  @override
  Widget build(BuildContext context) {
    const azureColor = Color(0xFF2563EB);
    const darkAzure = Color(0xFF1D4ED8);

    return SizedBox(
      width: 48,
      height: 48,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer live location pulse ring
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: azureColor.withValues(alpha: 0.16),
              boxShadow: [
                BoxShadow(
                  color: azureColor.withValues(alpha: 0.28),
                  blurRadius: 8,
                  spreadRadius: 1,
                ),
              ],
            ),
          ),

          // Live location puck
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [Color(0xFF3B82F6), darkAzure],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(color: Colors.white, width: 2.4),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.35),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.person_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),

          // Gold VIP Accent Dot
          Positioned(
            bottom: 3,
            right: 3,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFD4AF37),
                border: Border.all(color: Colors.white, width: 1.5),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Professional Modern Map Pin with Teardrop Anchor and Drop Shadow
class _MapPinWidget extends StatelessWidget {
  final Color primaryColor;
  final Color darkColor;
  final IconData icon;
  final String label;

  const _MapPinWidget({
    required this.primaryColor,
    required this.darkColor,
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 56,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.topCenter,
        children: [
          // Ground shadow beneath the needle tip
          Positioned(
            bottom: 0,
            child: Container(
              width: 14,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.35),
                borderRadius: const BorderRadius.all(Radius.elliptical(7, 2.5)),
              ),
            ),
          ),
          // Downward pointer arrow
          Positioned(
            bottom: 4,
            child: ClipPath(
              clipper: _PinTipClipper(),
              child: Container(
                width: 14,
                height: 12,
                color: darkColor,
              ),
            ),
          ),
          // Pin Head
          Positioned(
            top: 2,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [primaryColor, darkColor],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: Colors.white, width: 2.2),
                boxShadow: [
                  BoxShadow(
                    color: darkColor.withValues(alpha: 0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  icon,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PinTipClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width / 2, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
