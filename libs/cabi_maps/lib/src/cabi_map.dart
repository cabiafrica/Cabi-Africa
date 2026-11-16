import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'map_marker.dart';
import 'map_controller.dart';

/// Map theme for Cabi maps
enum CabiMapTheme {
  /// Dark theme - CartoDB Dark Matter (Uber-style)
  dark,

  /// Light theme - CartoDB Positron
  light,
}

/// Map source provider for Cabi platform
enum CabiMapSource {
  /// Google Maps Platform road tiles
  googleMaps,

  /// Cabi Africa Maps (High-definition Africa-optimized OpenStreetMap network)
  cabiAfrica,
}

/// Custom map widget for Cabi platform
/// Supports both Google Maps and Cabi Africa Maps
class CabiMap extends StatefulWidget {
  final LatLng initialCenter;
  final double initialZoom;
  final List<CabiMapMarker> markers;
  final List<LatLng>? routePoints;
  final Function(LatLng)? onTap;
  final Function(LatLng)? onLongPress;
  final bool showUserLocation;
  final bool enableInteraction;
  final CabiMapTheme theme;
  final CabiMapSource mapSource;
  final Function(LatLng center, bool hasGesture)? onCameraMove;
  final Function(CabiMapController)? onMapCreated;
  final String? apiKey;

  const CabiMap({
    super.key,
    this.initialCenter = const LatLng(-1.286389, 36.817223), // Nairobi
    this.initialZoom = 13.0,
    this.markers = const [],
    this.routePoints,
    this.onTap,
    this.onLongPress,
    this.onMapCreated,
    this.onCameraMove,
    this.showUserLocation = true,
    this.enableInteraction = true,
    this.theme = CabiMapTheme.dark,
    this.mapSource = CabiMapSource.googleMaps,
    this.apiKey,
  });

  @override
  State<CabiMap> createState() => _CabiMapState();
}

class _CabiMapState extends State<CabiMap> {
  late MapController _mapController;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    if (widget.onMapCreated != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        widget.onMapCreated!(CabiMapController(_mapController));
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: widget.initialCenter,
        initialZoom: widget.initialZoom,
        onPositionChanged: (camera, hasGesture) {
          if (widget.onCameraMove != null) {
            final center = camera.center;
            if (center != null) {
              widget.onCameraMove!(center, hasGesture);
            }
          }
        },
        onTap: widget.onTap != null
            ? (tapPosition, point) => widget.onTap!(point)
            : null,
        onLongPress: widget.onLongPress != null
            ? (tapPosition, point) => widget.onLongPress!(point)
            : null,
        interactionOptions: InteractionOptions(
          flags: widget.enableInteraction
              ? (InteractiveFlag.all & ~InteractiveFlag.rotate)
              : InteractiveFlag.none,
        ),
      ),
      children: [
        // Universal clean basemap tile layer (CartoDB Positron for light, Dark Matter for dark)
        TileLayer(
          key: ValueKey('cabi_clean_map_${widget.theme.name}'),
          urlTemplate: widget.theme == CabiMapTheme.dark
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          subdomains: const ['a', 'b', 'c', 'd'],
          userAgentPackageName: 'com.cabi.app',
          maxZoom: 20,
        ),

        // Route polyline if provided
        if (widget.routePoints != null && widget.routePoints!.isNotEmpty)
          PolylineLayer(
            polylines: [
              Polyline(
                points: widget.routePoints!,
                strokeWidth: 4.5,
                color: const Color(0xFFE5A93C),
                borderStrokeWidth: 2.0,
                borderColor: widget.theme == CabiMapTheme.dark
                    ? const Color(0xFF141414)
                    : Colors.white,
              ),
            ],
          ),

        // Markers
        MarkerLayer(
          markers: widget.markers.map((marker) {
            return Marker(
              point: marker.position,
              width: marker.width,
              height: marker.height,
              child: marker.onTap != null
                  ? GestureDetector(
                      onTap: marker.onTap,
                      child: marker.child,
                    )
                  : marker.child,
            );
          }).toList(),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }
}
