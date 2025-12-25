import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter/widgets.dart';

/// Controller for Cabi map operations
class CabiMapController {
  final MapController _mapController;

  CabiMapController(this._mapController);

  /// Move camera to a specific location
  void moveCamera(LatLng position, {double zoom = 15.0}) {
    _mapController.move(position, zoom);
  }

  /// Animate camera to a specific location
  Future<void> animateCamera(LatLng position, {double zoom = 15.0}) async {
    // Note: flutter_map doesn't have built-in animation
    // This is a simple move, but you can add custom animation if needed
    _mapController.move(position, zoom);
  }

  /// Fit bounds to show all markers
  void fitBounds(List<LatLng> points, {double padding = 50.0}) {
    if (points.isEmpty) return;

    double minLat = points.first.latitude;
    double maxLat = points.first.latitude;
    double minLng = points.first.longitude;
    double maxLng = points.first.longitude;

    for (var point in points) {
      if (point.latitude < minLat) minLat = point.latitude;
      if (point.latitude > maxLat) maxLat = point.latitude;
      if (point.longitude < minLng) minLng = point.longitude;
      if (point.longitude > maxLng) maxLng = point.longitude;
    }

    final bounds = LatLngBounds(
      LatLng(minLat, minLng),
      LatLng(maxLat, maxLng),
    );

    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: bounds,
        padding: EdgeInsets.all(padding),
      ),
    );
  }

  /// Get current center position
  LatLng get center => _mapController.camera.center;

  /// Get current zoom level
  double get zoom => _mapController.camera.zoom;
}
