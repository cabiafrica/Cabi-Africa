import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'map_marker.dart';
import 'map_controller.dart';
import 'offline_tile_provider.dart';

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

/// Traffic congestion status for route segments
enum TrafficStatus {
  clear,
  moderate,
  heavy,
  closure,
}

/// Segment of a route with colored traffic telemetry
class TrafficSegment {
  final List<LatLng> points;
  final TrafficStatus status;

  const TrafficSegment({
    required this.points,
    this.status = TrafficStatus.clear,
  });

  Color get color {
    switch (status) {
      case TrafficStatus.clear:
        return const Color(0xFF10B981); // Emerald flow
      case TrafficStatus.moderate:
        return const Color(0xFFF59E0B); // Amber delay
      case TrafficStatus.heavy:
        return const Color(0xFFEF4444); // Red congestion
      case TrafficStatus.closure:
        return const Color(0xFF991B1B); // Dark road closure
    }
  }
}

/// Alternative route option displayed in faint colors
class AlternativeRoute {
  final List<LatLng> points;
  final String label;
  final String extraTime;

  const AlternativeRoute({
    required this.points,
    required this.label,
    required this.extraTime,
  });
}

/// Custom map widget for Cabi platform
/// Supports both Google Maps and Cabi Africa Maps
class CabiMap extends StatefulWidget {
  final LatLng initialCenter;
  final double initialZoom;
  final List<CabiMapMarker> markers;
  final List<LatLng>? routePoints;
  final List<AlternativeRoute>? alternativeRoutes;
  final List<TrafficSegment>? trafficSegments;
  final Function(int routeIndex)? onSelectAlternativeRoute;
  final Function(LatLng)? onTap;
  final Function(LatLng)? onLongPress;
  final bool showUserLocation;
  final bool enableInteraction;
  final CabiMapTheme theme;
  final CabiMapSource mapSource;
  final bool isOfflineMode;
  final double? progressRatio; // 0.0 to 1.0 (portion of route already traveled, turns grey)
  final Function(LatLng center, bool hasGesture)? onCameraMove;
  final Function(CabiMapController)? onMapCreated;
  final String? apiKey;

  const CabiMap({
    super.key,
    this.initialCenter = const LatLng(-1.286389, 36.817223), // Nairobi
    this.initialZoom = 13.0,
    this.markers = const [],
    this.routePoints,
    this.progressRatio,
    this.alternativeRoutes,
    this.trafficSegments,
    this.onSelectAlternativeRoute,
    this.onTap,
    this.onLongPress,
    this.onMapCreated,
    this.onCameraMove,
    this.showUserLocation = true,
    this.enableInteraction = true,
    this.theme = CabiMapTheme.dark,
    this.mapSource = CabiMapSource.googleMaps,
    this.isOfflineMode = false,
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

  List<Marker> _generateAlternativeTurnMarkers(List<LatLng> points, bool isDark) {
    if (points.length < 2) return const [];
    final markers = <Marker>[];
    final step = math.max(3, (points.length / 5).floor());
    for (int i = 0; i < points.length - 1; i += step) {
      final p1 = points[i];
      final p2 = points[math.min(i + 1, points.length - 1)];
      final mid = LatLng(
        (p1.latitude + p2.latitude) / 2,
        (p1.longitude + p2.longitude) / 2,
      );
      final double dy = p2.latitude - p1.latitude;
      final double dx = (p2.longitude - p1.longitude) * math.cos(p1.latitude * math.pi / 180);
      final double angle = math.atan2(dx, dy);

      markers.add(
        Marker(
          point: mid,
          width: 16,
          height: 16,
          child: Transform.rotate(
            angle: angle,
            child: Icon(
              Icons.navigation,
              size: 11,
              color: isDark ? const Color(0x6694A3B8) : const Color(0x7764748B),
            ),
          ),
        ),
      );
    }
    return markers;
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = widget.theme == CabiMapTheme.dark;

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
        // Universal clean basemap tile layer (Monochrome black & white / grey shaded, Light & Dark modes)
        TileLayer(
          key: ValueKey('cabi_clean_map_${widget.theme.name}_${widget.isOfflineMode}'),
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.cabi.app',
          maxZoom: 19,
          tileProvider: widget.isOfflineMode ? CabiOfflineTileProvider(isDark: isDark) : null,
          tileBuilder: (context, tileWidget, tile) {
            return ColorFiltered(
              colorFilter: isDark
                  ? const ColorFilter.matrix(<double>[
                      // Dark Mode: Inverted monochrome obsidian, highlighting roads and removing green clutter
                      -0.2126 * 0.82, -0.7152 * 0.82, -0.0722 * 0.82, 0, 205,
                      -0.2126 * 0.82, -0.7152 * 0.82, -0.0722 * 0.82, 0, 210,
                      -0.2126 * 0.82, -0.7152 * 0.82, -0.0722 * 0.82, 0, 220,
                      0,              0,              0,             1, 0,
                    ])
                  : const ColorFilter.matrix(<double>[
                      // Light Mode: Clean desaturated black/white/grey shaded roads and major landmarks
                      0.2126 * 0.95, 0.7152 * 0.95, 0.0722 * 0.95, 0, 10,
                      0.2126 * 0.95, 0.7152 * 0.95, 0.0722 * 0.95, 0, 10,
                      0.2126 * 0.95, 0.7152 * 0.95, 0.0722 * 0.95, 0, 10,
                      0,             0,             0,            1, 0,
                    ]),
              child: tileWidget,
            );
          },
        ),

        // Up to 2 Alternative Routes in Faint Colors (beneath primary route)
        if (widget.alternativeRoutes != null && widget.alternativeRoutes!.isNotEmpty) ...[
          PolylineLayer(
            polylines: widget.alternativeRoutes!.map((alt) {
              return Polyline(
                points: alt.points,
                strokeWidth: 3.5,
                color: isDark
                    ? const Color(0x5594A3B8) // Faint muted slate in dark mode
                    : const Color(0x6664748B), // Faint slate in light mode
                borderStrokeWidth: 1.0,
                borderColor: isDark ? const Color(0x33000000) : const Color(0x33FFFFFF),
              );
            }).toList(),
          ),
          // In-map directional turn chevrons on alternative routes (turn by turn in faint color)
          ...widget.alternativeRoutes!.map((alt) {
            return MarkerLayer(
              markers: _generateAlternativeTurnMarkers(alt.points, isDark),
            );
          }),
        ],

        // Traffic Congestion Overlay Segments (Green flow, Amber moderate, Red heavy)
        if (widget.trafficSegments != null && widget.trafficSegments!.isNotEmpty)
          PolylineLayer(
            polylines: widget.trafficSegments!.map((seg) {
              return Polyline(
                points: seg.points,
                strokeWidth: 4.0,
                color: seg.color,
                borderStrokeWidth: 1.0,
                borderColor: Colors.black26,
              );
            }).toList(),
          ),

        // Primary Route Polylines (Covered portion turns grey; remaining portion highlights in gold)
        if (widget.routePoints != null && widget.routePoints!.isNotEmpty) ...[
          // Active remaining route in Gold
          Builder(
            builder: (context) {
              final int splitIdx = widget.progressRatio != null && widget.progressRatio! > 0
                  ? (widget.routePoints!.length * widget.progressRatio!.clamp(0.0, 1.0)).floor()
                  : 0;
              final remaining = splitIdx < widget.routePoints!.length - 1
                  ? widget.routePoints!.sublist(splitIdx)
                  : widget.routePoints!;
              return PolylineLayer(
                polylines: [
                  Polyline(
                    points: remaining,
                    strokeWidth: 5.0,
                    color: const Color(0xFFD4AF37),
                    borderStrokeWidth: 2.0,
                    borderColor: isDark ? const Color(0xFF0A0A0B) : Colors.white,
                  ),
                ],
              );
            },
          ),
          // Covered road grey trail (rendered on top of covered traffic segment)
          if (widget.progressRatio != null && widget.progressRatio! > 0) ...[
            Builder(
              builder: (context) {
                final int splitIdx = (widget.routePoints!.length * widget.progressRatio!.clamp(0.0, 1.0)).floor();
                if (splitIdx > 0) {
                  final covered = widget.routePoints!.sublist(0, math.min(splitIdx + 1, widget.routePoints!.length));
                  return PolylineLayer(
                    polylines: [
                      Polyline(
                        points: covered,
                        strokeWidth: 5.5,
                        color: const Color(0xFF64748B), // Covered road turns grey
                        borderStrokeWidth: 1.5,
                        borderColor: isDark ? const Color(0xFF0F172A) : Colors.white70,
                      ),
                    ],
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ],

        // Markers Layer
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
