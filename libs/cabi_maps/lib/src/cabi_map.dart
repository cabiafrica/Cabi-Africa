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

/// Custom map widget for Cabi platform
/// Uses OpenStreetMap for free, unlimited usage
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

  final Function(CabiMapController)? onMapCreated;

  const CabiMap({
    super.key,
    this.initialCenter = const LatLng(-1.286389, 36.817223), // Nairobi
    this.initialZoom = 13.0,
    this.markers = const [],
    this.routePoints,
    this.onTap,
    this.onLongPress,
    this.onMapCreated,
    this.showUserLocation = true,
    this.enableInteraction = true,
    this.theme = CabiMapTheme.dark,
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
        // Map tile layer (theme-aware)
        TileLayer(
          urlTemplate: widget.theme == CabiMapTheme.dark
              ? 'https://basemaps.cartocdn.com/rastertiles/dark_matter/{z}/{x}/{y}@2x.png'
              : 'https://basemaps.cartocdn.com/rastertiles/positron/{z}/{x}/{y}@2x.png',
          userAgentPackageName: 'com.cabi.app',
          maxZoom: 19,
          retinaMode: true,
        ),

        // Route polyline if provided
        if (widget.routePoints != null && widget.routePoints!.isNotEmpty)
          PolylineLayer(
            polylines: [
              Polyline(
                points: widget.routePoints!,
                strokeWidth: 4.0,
                color: Colors.blue,
                borderStrokeWidth: 2.0,
                borderColor: Colors.blue.shade900,
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
              child: GestureDetector(
                onTap: marker.onTap,
                child: marker.child,
              ),
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
