import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

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
    this.width = 40.0,
    this.height = 40.0,
    this.onTap,
  });

  /// Create a driver marker
  factory CabiMapMarker.driver({
    required LatLng position,
    required String driverId,
    bool isOnline = true,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isOnline ? Colors.green : Colors.grey,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: const Icon(
          Icons.local_taxi,
          color: Colors.white,
          size: 24,
        ),
      ),
    );
  }

  /// Create a passenger marker
  factory CabiMapMarker.passenger({
    required LatLng position,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.blue,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: const Icon(
          Icons.person,
          color: Colors.white,
          size: 24,
        ),
      ),
    );
  }

  /// Create a pickup location marker
  factory CabiMapMarker.pickup({
    required LatLng position,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: 30,
      height: 30,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.green,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: const Icon(
          Icons.circle,
          color: Colors.white,
          size: 12,
        ),
      ),
    );
  }

  /// Create a dropoff location marker
  factory CabiMapMarker.dropoff({
    required LatLng position,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      width: 30,
      height: 30,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.red,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: const Icon(
          Icons.location_on,
          color: Colors.white,
          size: 18,
        ),
      ),
    );
  }

  /// Create a custom marker with icon
  factory CabiMapMarker.custom({
    required LatLng position,
    required IconData icon,
    Color color = Colors.blue,
    VoidCallback? onTap,
  }) {
    return CabiMapMarker(
      position: position,
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 24,
        ),
      ),
    );
  }
}
