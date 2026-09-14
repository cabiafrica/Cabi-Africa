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
        // Map tile layer based on selected map source
        if (widget.mapSource == CabiMapSource.googleMaps)
          TileLayer(
            key: const ValueKey('google_maps_layer'),
            urlTemplate: (widget.apiKey != null && widget.apiKey!.isNotEmpty)
                ? 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${widget.apiKey}'
                : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=AIzaSyA_ybfC1sxL4K92fKiuIsfHLkFK7sWl9-0',
            subdomains: const ['0', '1', '2', '3'],
            userAgentPackageName: 'com.cabi.app',
            maxZoom: 20,
            tileBuilder: widget.theme == CabiMapTheme.dark
                ? (context, tileWidget, tile) {
                    return ColorFiltered(
                      colorFilter: const ColorFilter.matrix([
                        -0.85, 0.0, 0.0, 0.0, 240.0,
                        0.0, -0.85, 0.0, 0.0, 240.0,
                        0.0, 0.0, -0.85, 0.0, 240.0,
                        0.0, 0.0, 0.0, 1.0, 0.0,
                      ]),
                      child: tileWidget,
                    );
                  }
                : null,
          )
        else
          TileLayer(
            key: const ValueKey('cabi_africa_maps_layer'),
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.cabi.app',
            maxZoom: 19,
            tileBuilder: widget.theme == CabiMapTheme.dark
                ? (context, tileWidget, tile) {
                    return ColorFiltered(
                      colorFilter: const ColorFilter.matrix([
                        -0.85, 0.0, 0.0, 0.0, 240.0,
                        0.0, -0.85, 0.0, 0.0, 240.0,
                        0.0, 0.0, -0.85, 0.0, 240.0,
                        0.0, 0.0, 0.0, 1.0, 0.0,
                      ]),
                      child: tileWidget,
                    );
                  }
                : null,
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
