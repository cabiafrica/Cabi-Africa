import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'widgets/radar_animation.dart';

/// Helper for moderate, executive category colors (never aggressive, strictly no purple)
Color resolveVehicleCategoryColor(String? category, {Color? customColor}) {
  if (customColor != null) return customColor;
  final cat = (category ?? 'STANDARD').trim().toUpperCase();
  switch (cat) {
    case 'BODA':
    case 'MOTO':
      return const Color(0xFFD97706); // Warm Terracotta Amber
    case 'BASIC':
    case 'CABIGO':
    case 'STANDARD':
      return const Color(0xFF0D9488); // Subtle Petrol Teal / Sage
    case 'PREMIUM':
    case 'EXECUTIVE':
      return const Color(0xFFD4AF37); // Presidential Champagne Gold
    case 'XL':
    case 'SUV':
    case 'VAN':
      return const Color(0xFF2563EB); // Executive Steel Navy
    default:
      return const Color(0xFF0D9488);
  }
}

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

  /// Create a professional onscreen vehicle icon with 3D moving rendering and category color
  factory CabiMapMarker.driver({
    required LatLng position,
    required String driverId,
    bool isOnline = true,
    bool showRadar = false,
    double radiusKm = 5.0,
    double bearing = 0.0,
    bool isMoving = false,
    String category = 'STANDARD',
    Color? categoryColor,
    VoidCallback? onTap,
  }) {
    final bool displayRadar = isOnline && showRadar;
    final double dimension = displayRadar ? 360.0 : 54.0;
    final resolvedColor = resolveVehicleCategoryColor(category, customColor: categoryColor);

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
                _Vehicle3DMarker(
                  isOnline: true,
                  bearing: bearing,
                  isMoving: isMoving,
                  category: category,
                  accentColor: resolvedColor,
                ),
              ],
            )
          : _Vehicle3DMarker(
              isOnline: isOnline,
              bearing: bearing,
              isMoving: isMoving,
              category: category,
              accentColor: resolvedColor,
            ),
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
      darkColor: Color(0xFF065F46),
      icon: Icons.my_location_rounded,
      label: 'PICKUP',
      ringColor: Color(0xFFD4AF37),
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
      width: 80,
      height: 72,
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
      width: 90,
      height: 72,
      child: const _MapPinWidget(
        primaryColor: Color(0xFFE5A93C),
        darkColor: Color(0xFFB45309),
        icon: Icons.flag_rounded,
        label: 'DESTINATION',
        ringColor: Color(0xFF1E293B),
      ),
    );
  }

  /// Create a route issue / road hazard pin (Closure, Construction, Congestion)
  factory CabiMapMarker.hazard({
    required LatLng position,
    required String title,
    String? delayText,
    bool isClosure = false,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: 140,
      height: 44,
      child: _RouteHazardMarkerWidget(
        title: title,
        delayText: delayText,
        isClosure: isClosure,
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

/// Modern 3D Isometric Vehicle Marker with Category Color Accent & Moving Beam
class _Vehicle3DMarker extends StatelessWidget {
  final bool isOnline;
  final double bearing;
  final bool isMoving;
  final String category;
  final Color accentColor;

  const _Vehicle3DMarker({
    required this.isOnline,
    this.bearing = 0.0,
    this.isMoving = false,
    this.category = 'STANDARD',
    this.accentColor = const Color(0xFF0D9488),
  });

  @override
  Widget build(BuildContext context) {
    final catUpper = category.trim().toUpperCase();
    final isBoda = catUpper == 'BODA' || catUpper == 'MOTO';
    final isXl = catUpper == 'XL' || catUpper == 'SUV' || catUpper == 'VAN';

    return Transform.rotate(
      angle: bearing * math.pi / 180,
      child: SizedBox(
        width: 52,
        height: 52,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // 1. Forward Headlight Illumination Beam (activates when on the move)
            if (isMoving && isOnline)
              Positioned(
                top: 0,
                child: CustomPaint(
                  size: const Size(36, 22),
                  painter: _HeadlightBeamPainter(color: accentColor),
                ),
              ),

            // 2. 3D Isometric Vehicle Chassis with Depth Shadows
            Positioned(
              bottom: 6,
              child: isBoda
                  ? _Boda3DChassis(accentColor: accentColor, isOnline: isOnline)
                  : (isXl
                      ? _SUV3DChassis(accentColor: accentColor, isOnline: isOnline)
                      : _Sedan3DChassis(accentColor: accentColor, isOnline: isOnline)),
            ),

            // 3. Online/Offline Live Status Pip
            if (!isMoving)
              Positioned(
                bottom: 2,
                right: 2,
                child: Container(
                  width: 9,
                  height: 9,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isOnline ? const Color(0xFF10B981) : Colors.grey,
                    border: Border.all(color: Colors.black87, width: 1.5),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Headlight forward illumination beam cone
class _HeadlightBeamPainter extends CustomPainter {
  final Color color;
  const _HeadlightBeamPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.bottomCenter,
        end: Alignment.topCenter,
        colors: [
          color.withValues(alpha: 0.38),
          color.withValues(alpha: 0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final path = Path()
      ..moveTo(size.width * 0.35, size.height)
      ..lineTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width * 0.65, size.height)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _HeadlightBeamPainter oldDelegate) =>
      oldDelegate.color != color;
}

/// 3D Isometric Sedan Chassis (Standard & Executive)
class _Sedan3DChassis extends StatelessWidget {
  final Color accentColor;
  final bool isOnline;

  const _Sedan3DChassis({required this.accentColor, required this.isOnline});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 38,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A), // Dark slate body
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: accentColor, width: 1.6),
        boxShadow: const [
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 4,
            offset: Offset(2, 3),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Front Headlight pips
          Positioned(
            top: 1,
            left: 2,
            right: 2,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 3.5,
                  height: 2,
                  decoration: BoxDecoration(
                    color: Colors.amber.shade200,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
                Container(
                  width: 3.5,
                  height: 2,
                  decoration: BoxDecoration(
                    color: Colors.amber.shade200,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
              ],
            ),
          ),
          // Front Windshield (Gradient Glass)
          Positioned(
            top: 5,
            child: Container(
              width: 16,
              height: 7,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF38BDF8), Color(0xFF0284C7)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // 3D Roof Top with moderate category color
          Positioned(
            top: 13,
            child: Container(
              width: 17,
              height: 12,
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: isOnline ? 0.95 : 0.4),
                borderRadius: BorderRadius.circular(2),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 1,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              child: Center(
                child: Container(
                  width: 5,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.8),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
          ),
          // Rear Window
          Positioned(
            bottom: 6,
            child: Container(
              width: 15,
              height: 5,
              decoration: BoxDecoration(
                color: const Color(0xFF0369A1),
                borderRadius: BorderRadius.circular(1.5),
              ),
            ),
          ),
          // Rear Tail-light pips
          Positioned(
            bottom: 1,
            left: 2,
            right: 2,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 3,
                  height: 1.5,
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
                Container(
                  width: 3,
                  height: 1.5,
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// 3D Motorcycle Chassis (Boda Boda)
class _Boda3DChassis extends StatelessWidget {
  final Color accentColor;
  final bool isOnline;

  const _Boda3DChassis({required this.accentColor, required this.isOnline});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 15,
      height: 34,
      decoration: const BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 3,
            offset: Offset(1.5, 2.5),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Front Wheel & Tire
          Positioned(
            top: 0,
            child: Container(
              width: 4,
              height: 8,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(2),
                border: Border.all(color: Colors.grey.shade400, width: 0.5),
              ),
            ),
          ),
          // Handlebars
          Positioned(
            top: 7,
            child: Container(
              width: 14,
              height: 2,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ),
          // Rider Helmet (accentColor)
          Positioned(
            top: 11,
            child: Container(
              width: 9,
              height: 9,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: accentColor,
                border: Border.all(color: Colors.black, width: 1),
              ),
            ),
          ),
          // Bike Seat & Body
          Positioned(
            bottom: 5,
            child: Container(
              width: 7,
              height: 13,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(2),
                border: Border.all(color: accentColor, width: 1),
              ),
            ),
          ),
          // Rear Wheel
          Positioned(
            bottom: 0,
            child: Container(
              width: 4,
              height: 7,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// 3D SUV / Van Chassis (Diplomatic XL)
class _SUV3DChassis extends StatelessWidget {
  final Color accentColor;
  final bool isOnline;

  const _SUV3DChassis({required this.accentColor, required this.isOnline});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 27,
      height: 42,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(5.5),
        border: Border.all(color: accentColor, width: 1.8),
        boxShadow: const [
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 5,
            offset: Offset(2.5, 3.5),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Front Headlight bar
          Positioned(
            top: 1,
            left: 2,
            right: 2,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 4,
                  height: 2,
                  decoration: BoxDecoration(
                    color: Colors.amber.shade200,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
                Container(
                  width: 4,
                  height: 2,
                  decoration: BoxDecoration(
                    color: Colors.amber.shade200,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
              ],
            ),
          ),
          // Front Windshield
          Positioned(
            top: 5,
            child: Container(
              width: 19,
              height: 8,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF38BDF8), Color(0xFF0284C7)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // SUV Extended Roof Rack & Canopy
          Positioned(
            top: 14,
            child: Container(
              width: 20,
              height: 18,
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: isOnline ? 0.95 : 0.4),
                borderRadius: BorderRadius.circular(2),
              ),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(width: 1.5, height: 14, color: Colors.black26),
                    Container(width: 1.5, height: 14, color: Colors.black26),
                  ],
                ),
              ),
            ),
          ),
          // Rear Window
          Positioned(
            bottom: 4,
            child: Container(
              width: 18,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFF0369A1),
                borderRadius: BorderRadius.circular(1),
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

/// Professional Modern Map Pin with Teardrop Anchor, Pill Badge and Multi-Ring Glow
class _MapPinWidget extends StatelessWidget {
  final Color primaryColor;
  final Color darkColor;
  final IconData icon;
  final String label;
  final Color ringColor;

  const _MapPinWidget({
    required this.primaryColor,
    required this.darkColor,
    required this.icon,
    required this.label,
    this.ringColor = const Color(0xFFD4AF37),
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Top Pill Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(3),
            border: Border.all(color: ringColor, width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            style: TextStyle(
              color: ringColor,
              fontWeight: FontWeight.w900,
              fontSize: 9,
              letterSpacing: 0.6,
            ),
          ),
        ),
        const SizedBox(height: 2),
        // Pin Head with dual-ring border
        SizedBox(
          width: 42,
          height: 48,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.topCenter,
            children: [
              // Ground shadow beneath needle tip
              Positioned(
                bottom: 0,
                child: Container(
                  width: 14,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.4),
                    borderRadius: const BorderRadius.all(Radius.elliptical(7, 2)),
                  ),
                ),
              ),
              // Pointer Needle
              Positioned(
                bottom: 3,
                child: ClipPath(
                  clipper: _PinTipClipper(),
                  child: Container(
                    width: 12,
                    height: 10,
                    color: primaryColor,
                  ),
                ),
              ),
              // Pin Circle
              Positioned(
                top: 0,
                child: Container(
                  width: 36,
                  height: 36,
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
                        color: primaryColor.withValues(alpha: 0.5),
                        blurRadius: 10,
                        spreadRadius: 1,
                      ),
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Icon(
                      icon,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Route Hazard and Traffic Delay Badge Widget
class _RouteHazardMarkerWidget extends StatelessWidget {
  final String title;
  final String? delayText;
  final bool isClosure;

  const _RouteHazardMarkerWidget({
    required this.title,
    this.delayText,
    this.isClosure = false,
  });

  @override
  Widget build(BuildContext context) {
    final alertColor = isClosure ? const Color(0xFFEF4444) : const Color(0xFFF59E0B);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(3),
        border: Border.all(color: alertColor, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: alertColor.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isClosure ? Icons.block_rounded : Icons.warning_amber_rounded,
            color: alertColor,
            size: 14,
          ),
          const SizedBox(width: 4),
          Flexible(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 9.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (delayText != null)
                  Text(
                    delayText!,
                    style: TextStyle(
                      color: alertColor,
                      fontWeight: FontWeight.w800,
                      fontSize: 8.5,
                    ),
                  ),
              ],
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
