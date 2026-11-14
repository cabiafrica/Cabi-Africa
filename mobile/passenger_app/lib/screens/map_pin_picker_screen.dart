import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';

/// Interactive Fullscreen Map Pin Picker Screen
/// Allows user to pan/zoom the map to drop a pin on exact location,
/// with live reverse-geocoded address display and confirmation.
class MapPinPickerScreen extends StatefulWidget {
  final LatLng? initialLocation;
  final String title;
  final LatLng? userLocation;

  const MapPinPickerScreen({
    super.key,
    this.initialLocation,
    this.title = 'Select location on map',
    this.userLocation,
  });

  @override
  State<MapPinPickerScreen> createState() => _MapPinPickerScreenState();
}

class _MapPinPickerScreenState extends State<MapPinPickerScreen> {
  late LatLng _currentCenter;
  CabiMapController? _mapController;
  final GooglePlacesService _placesService = GooglePlacesService();

  String _address = 'Locating pin position...';
  bool _isGeocoding = false;
  Timer? _debounceTimer;

  // Nairobi default fallback
  static const LatLng _nairobi = LatLng(-1.286389, 36.817223);

  @override
  void initState() {
    super.initState();
    _currentCenter = widget.initialLocation ?? widget.userLocation ?? _nairobi;
    _reverseGeocode(_currentCenter);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  Future<void> _reverseGeocode(LatLng coords) async {
    if (!mounted) return;
    setState(() => _isGeocoding = true);

    try {
      final address = await _placesService.reverseGeocode(coords);
      if (mounted) {
        setState(() {
          _address = (address != null && address.trim().isNotEmpty)
              ? address
              : 'Pin at ${coords.latitude.toStringAsFixed(4)}, ${coords.longitude.toStringAsFixed(4)}';
          _isGeocoding = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _address = 'Pin at ${coords.latitude.toStringAsFixed(4)}, ${coords.longitude.toStringAsFixed(4)}';
          _isGeocoding = false;
        });
      }
    }
  }

  void _onCameraMove(LatLng center, bool hasGesture) {
    _currentCenter = center;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      _reverseGeocode(center);
    });
  }

  void _recenterOnUser() {
    final target = widget.userLocation ?? _nairobi;
    _mapController?.animateCamera(target, zoom: 16.0);
    _reverseGeocode(target);
  }

  void _confirmSelection() {
    Navigator.of(context).pop({
      'name': _address,
      'location': _currentCenter,
      'latitude': _currentCenter.latitude,
      'longitude': _currentCenter.longitude,
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF121212) : Colors.white,
      body: Stack(
        children: [
          // ── 1. Fullscreen Interactive Map ──
          Positioned.fill(
            child: CabiMap(
              initialCenter: _currentCenter,
              initialZoom: 16.0,
              showUserLocation: true,
              theme: isDark ? CabiMapTheme.dark : CabiMapTheme.light,
              mapSource: CabiMapSource.googleMaps,
              onMapCreated: (controller) {
                _mapController = controller;
              },
              onCameraMove: _onCameraMove,
              onTap: (point) {
                _mapController?.animateCamera(point);
                _reverseGeocode(point);
              },
            ),
          ),

          // ── 2. Center Stationary Map Pin with Target Dot ──
          Center(
            child: IgnorePointer(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 40),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Location pin with shadow
                    Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 10,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.location_on_rounded,
                        size: 48,
                        color: Color(0xFFFFD700), // Cabi Signature Gold
                      ),
                    ),
                    // Ground target anchor dot
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.7),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── 3. Floating Top Bar ──
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 16,
            right: 16,
            child: Row(
              children: [
                // Circular Back Button
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF222222) : Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.15),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: Icon(
                      Icons.arrow_back_rounded,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ),
                const SizedBox(width: 12),
                // Title Pill
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF222222) : Colors.white,
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.12),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      widget.title,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── 4. Floating GPS Recenter Button ──
          Positioned(
            right: 16,
            bottom: 220,
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF222222) : Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.15),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: IconButton(
                icon: const Icon(Icons.my_location_rounded, color: Color(0xFF0F7B55)),
                onPressed: _recenterOnUser,
                tooltip: 'My location',
              ),
            ),
          ),

          // ── 5. Bottom Confirmation Card ──
          Positioned(
            left: 16,
            right: 16,
            bottom: MediaQuery.of(context).padding.bottom + 16,
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.18),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Label & Loading state
                  Row(
                    children: [
                      const Icon(
                        Icons.place_rounded,
                        size: 18,
                        color: Color(0xFFD4AF37),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'PINNED LOCATION',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.0,
                          color: const Color(0xFFD4AF37),
                        ),
                      ),
                      const Spacer(),
                      if (_isGeocoding)
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFFFD700)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Formatted Address
                  Text(
                    _address,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Coordinates Chip
                  Text(
                    '${_currentCenter.latitude.toStringAsFixed(5)}, ${_currentCenter.longitude.toStringAsFixed(5)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white54 : Colors.black54,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Confirm Button with Golden Look
                  Container(
                    width: double.infinity,
                    height: 52,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFFD700).withValues(alpha: 0.35),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: _confirmSelection,
                      icon: const Icon(Icons.check_circle_rounded, size: 20, color: Colors.black),
                      label: Text(
                        'Select This Location',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.3,
                          color: Colors.black,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFD700),
                        foregroundColor: Colors.black,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
