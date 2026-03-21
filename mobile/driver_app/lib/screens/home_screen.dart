import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart' as legacy_provider;
import '../providers/ride_request_provider.dart';
import '../widgets/ride_request_modal.dart';
import '../providers/auth_provider.dart';
import '../widgets/face_verification_modal.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _isOnline = false;
  bool _isLoading = false;
  bool _isFaceVerified = false;
  bool _isVerificationInProgress = false;
  double _tripRadiusKm = 2.0; // User required Trip Radius feature
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
    if (!_isOnline) {
      // 1. Shift validation (mock) - Block if shift > 12h
      // In production, this would be a call to a ShiftService or Backend
      bool hasReachedShiftLimit() => DateTime.now().hour > 22 && DateTime.now().hour < 5; 
      
      if (hasReachedShiftLimit()) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Shift limit reached (12 hours). Please rest.'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
        return;
      }
      // Note: _tripRadiusKm value would be sent to the backend here
      debugPrint('Going online with radius: ${_tripRadiusKm}km');

      // 2. Face Liveness Check (Daily mandatory per plan)
      if (!_isFaceVerified) {
        setState(() => _isVerificationInProgress = true);
        
        await _showFaceVerificationModal();
        
        if (!_isFaceVerified) {
           setState(() => _isVerificationInProgress = false);
           return; // Abort go-online if verified failed/closed
        }
        setState(() => _isVerificationInProgress = false);
      }
    }

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

  Future<void> _showFaceVerificationModal() async {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return FaceVerificationModal(
          onVerified: () {
            setState(() {
              _isFaceVerified = true;
            });
          },
        );
      },
    );
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
            theme: Theme.of(context).brightness == Brightness.dark
                ? CabiMapTheme.dark
                : CabiMapTheme.light,
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
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _StatCard(label: 'Today', value: 'KES 0'),
                        _StatCard(label: 'Trips', value: '0'),
                        _StatCard(label: 'Rating', value: '5.0 ★'),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ] else ...[
                    // Trip Radius Filter (when offline)
                    Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Trip Radius Filter',
                              style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                            ),
                            Text(
                              '${_tripRadiusKm.toStringAsFixed(1)} km',
                              style: GoogleFonts.outfit(color: primaryGold, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ],
                        ),
                        SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            activeTrackColor: primaryGold,
                            inactiveTrackColor: Colors.white12,
                            thumbColor: primaryGold,
                            overlayColor: primaryGold.withValues(alpha: 0.2),
                            trackHeight: 4.0,
                          ),
                          child: Slider(
                            value: _tripRadiusKm,
                            min: 0.5,
                            max: 5.0, // Per user specification: 500m to 5km
                            divisions: 9, // 0.5km steps
                            onChanged: (val) {
                              setState(() {
                                _tripRadiusKm = val;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],

                  // Go Online / Offline button
                  GestureDetector(
                    onTap: (_isLoading || _isVerificationInProgress) ? null : _toggleOnline,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                      width: double.infinity,
                      height: 58,
                      decoration: BoxDecoration(
                        color:
                            _isOnline 
                                ? const Color(0xFF1A1A1A) 
                                : (_isVerificationInProgress ? Colors.white10 : primaryGold),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _isOnline
                              ? Colors.redAccent.withValues(alpha: 0.7)
                              : Colors.transparent,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: (_isOnline || _isVerificationInProgress)
                                ? Colors.transparent
                                : primaryGold.withValues(alpha: 0.35),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Center(
                        child: (_isLoading || _isVerificationInProgress)
                            ? SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: _isOnline
                                      ? Colors.redAccent
                                      : (_isVerificationInProgress ? Colors.white : Colors.black),
                                ),
                              )
                            : Text(
                                _isOnline ? 'Go Offline' : (_isVerificationInProgress ? 'Verifying...' : 'Go Online'),
                                style: GoogleFonts.outfit(
                                  color: _isOnline
                                      ? Colors.redAccent
                                      : (_isVerificationInProgress ? Colors.white : Colors.black),
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
          
          // ── Ride Request Modal Overlay ──────────────────────────
          legacy_provider.Consumer<RideRequestProvider>(
            builder: (context, rideProvider, _) {
              if (rideProvider.currentRideRequest != null) {
                final authState = ref.read(authProvider);
                final driverId = (authState is Authenticated) ? (authState.userId ?? 'unknown') : 'unknown';
                
                return RideRequestModal(
                  requestData: rideProvider.currentRideRequest!,
                  driverId: driverId,
                );
              }
              return const SizedBox.shrink();
            },
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
