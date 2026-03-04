import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:google_fonts/google_fonts.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _isOnline = false;
  bool _isLoading = false;
  LatLng _driverLocation =
      const LatLng(-1.286389, 36.817223); // Nairobi default
  CabiMapController? _mapController;
  StreamSubscription<Position>? _locationSubscription;

  static const primaryGold = Color(0xFFFFD700);
  static const prestigeBlack = Color(0xFF0A0A0A);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initLocation();
    });
  }

  Future<void> _initLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    try {
      final pos = await Geolocator.getCurrentPosition();
      if (mounted) {
        setState(() {
          _driverLocation = LatLng(pos.latitude, pos.longitude);
        });
        _mapController?.animateCamera(_driverLocation, zoom: 15.0);
      }
    } catch (_) {}

    _locationSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((pos) {
      if (mounted) {
        setState(() {
          _driverLocation = LatLng(pos.latitude, pos.longitude);
        });
        if (_isOnline) {
          _mapController?.animateCamera(_driverLocation, zoom: 15.0);
        }
      }
    });
  }

  Future<void> _toggleOnline() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 800));
    setState(() {
      _isOnline = !_isOnline;
      _isLoading = false;
    });
    if (_isOnline) {
      _mapController?.animateCamera(_driverLocation, zoom: 15.0);
    }
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: prestigeBlack,
      body: Stack(
        children: [
          // ── Full-screen Map ──────────────────────────────────────
          CabiMap(
            initialCenter: _driverLocation,
            initialZoom: 14.0,
            theme: CabiMapTheme.dark,
            markers: [
              CabiMapMarker.driver(
                position: _driverLocation,
                driverId: 'me',
                isOnline: _isOnline,
              ),
            ],
            showUserLocation: true,
            onMapCreated: (c) {
              _mapController = c;
            },
          ),

          // ── Top status bar ───────────────────────────────────────
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            right: 16,
            child: Row(
              children: [
                // Status pill
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: _isOnline ? const Color(0xFF1A1A1A) : Colors.black87,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: _isOnline
                          ? primaryGold.withValues(alpha: 0.6)
                          : Colors.white12,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isOnline ? primaryGold : Colors.white38,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isOnline ? 'ONLINE' : 'OFFLINE',
                        style: GoogleFonts.outfit(
                          color: _isOnline ? primaryGold : Colors.white38,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                // Center-on-me button
                _MapButton(
                  icon: Icons.my_location,
                  onTap: () => _mapController?.animateCamera(_driverLocation,
                      zoom: 15.0),
                ),
              ],
            ),
          ),

          // ── Bottom go-online panel ───────────────────────────────
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(
                  24, 24, 24, MediaQuery.of(context).padding.bottom + 24),
              decoration: BoxDecoration(
                color: prestigeBlack,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.5),
                    blurRadius: 24,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Handle bar
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white12,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Status headline
                  Text(
                    _isOnline ? 'You are online' : 'Ready to drive?',
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _isOnline
                        ? 'Waiting for trip requests nearby...'
                        : 'Go online to start receiving trips.',
                    style: GoogleFonts.outfit(
                      color: Colors.white38,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Stats row (when online)
                  if (_isOnline) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: const [
                        _StatCard(label: 'Today', value: 'KES 0'),
                        _StatCard(label: 'Trips', value: '0'),
                        _StatCard(label: 'Rating', value: '5.0 ★'),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Go Online / Offline button
                  GestureDetector(
                    onTap: _isLoading ? null : _toggleOnline,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                      width: double.infinity,
                      height: 58,
                      decoration: BoxDecoration(
                        color:
                            _isOnline ? const Color(0xFF1A1A1A) : primaryGold,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _isOnline
                              ? Colors.redAccent.withValues(alpha: 0.7)
                              : Colors.transparent,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: _isOnline
                                ? Colors.transparent
                                : primaryGold.withValues(alpha: 0.35),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Center(
                        child: _isLoading
                            ? SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: _isOnline
                                      ? Colors.redAccent
                                      : Colors.black,
                                ),
                              )
                            : Text(
                                _isOnline ? 'Go Offline' : 'Go Online',
                                style: GoogleFonts.outfit(
                                  color: _isOnline
                                      ? Colors.redAccent
                                      : Colors.black,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 17,
                                  letterSpacing: 0.5,
                                ),
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

class _MapButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _MapButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.black87,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.4),
              blurRadius: 8,
            ),
          ],
        ),
        child: Icon(icon, color: Colors.white70, size: 20),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;

  const _StatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.outfit(
            color: const Color(0xFFFFD700),
            fontWeight: FontWeight.w700,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.outfit(
            color: Colors.white38,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
