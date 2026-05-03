import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:driver_app/theme/app_theme.dart';
import '../providers/ride_request_provider.dart';
import '../widgets/ride_request_modal.dart';
import '../providers/auth_provider.dart';
import '../widgets/face_verification_modal.dart';
import '../widgets/radar_animation.dart';
import '../providers/providers.dart';

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
  double _tripRadiusKm = 2.0; 
  LatLng _driverLocation =
      const LatLng(-1.286389, 36.817223); // Nairobi default
  CabiMapController? _mapController;
  StreamSubscription<Position>? _locationSubscription;

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
    final authState = ref.read(authProvider);
    if (authState is! Authenticated) return;
    
    final driverProfile = authState.user?['driverProfile'];
    if (driverProfile == null) return;
    final driverId = driverProfile['id'];
    
    final rideService = ref.read(rideServiceProvider);

    if (!_isOnline) {
      if (!_isFaceVerified) {
        setState(() => _isVerificationInProgress = true);
        await _showFaceVerificationModal();
        if (!_isFaceVerified) {
           setState(() => _isVerificationInProgress = false);
           return; 
        }
        setState(() => _isVerificationInProgress = false);
      }
    }

    setState(() => _isLoading = true);
    
    try {
      await rideService.toggleOnlineStatus(driverId, !_isOnline);
      if (mounted) {
        setState(() {
          _isOnline = !_isOnline;
          _isLoading = false;
        });
        if (_isOnline) {
          _mapController?.animateCamera(_driverLocation, zoom: 15.0);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to toggle status: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _showFaceVerificationModal() async {
    final authState = ref.read(authProvider);
    final driverId = (authState is Authenticated) ? authState.userId : 'unknown';
    final authService = ref.read(authServiceProvider);

    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return FaceVerificationModal(
          userId: driverId ?? 'unknown',
          authService: authService,
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
      backgroundColor: AppTheme.darkBackground,
      body: Stack(
        children: [
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

          if (_isOnline)
            Center(
              child: RadarAnimation(isOnline: _isOnline),
            ),

          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            right: 16,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: _isOnline ? AppTheme.darkSurface : Colors.black.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: _isOnline
                          ? AppTheme.primaryColor.withValues(alpha: 0.6)
                          : Colors.white.withValues(alpha: 0.1),
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
                          color: _isOnline ? AppTheme.primaryColor : Colors.white24,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isOnline ? 'ONLINE' : 'OFFLINE',
                        style: GoogleFonts.outfit(
                          color: _isOnline ? AppTheme.primaryColor : Colors.white24,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                _MapButton(
                  icon: Icons.my_location,
                  onTap: () => _mapController?.animateCamera(_driverLocation,
                      zoom: 15.0),
                ),
              ],
            ),
          ),

          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(
                  24, 24, 24, MediaQuery.of(context).padding.bottom + 24),
              decoration: BoxDecoration(
                color: AppTheme.darkBackground,
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
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 20),

                  const Center(
                    child: Text(
                      "PRESTIGE GOLD v1.1.0+6",
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  Consumer(
                    builder: (context, ref, child) {
                      final authState = ref.watch(authProvider);
                      final driverProfile = authState.user?['driverProfile'];
                      final vehicle = driverProfile?['vehicles'];
                      
                      if (vehicle == null) return const SizedBox.shrink();
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.directions_car, color: AppTheme.primaryColor, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              "${vehicle['make']} ${vehicle['model']} • ${vehicle['plateNumber']}",
                              style: GoogleFonts.outfit(
                                color: Colors.white.withValues(alpha: 0.8),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),

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
                      color: AppTheme.darkTextSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 24),

                  if (_isOnline) ...[
                    Consumer(
                      builder: (context, ref, child) {
                        final authState = ref.watch(authProvider);
                        final user = (authState is Authenticated) ? authState.user : null;
                        
                        final rating = user?['rating']?.toDouble() ?? 5.0;
                        final trips = user?['tripsCount']?.toInt() ?? 0;
                        
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            const _StatCard(label: 'Today', value: 'KES 0'), // Still needs earnings integration
                            _StatCard(label: 'Trips', value: trips.toString()),
                            _StatCard(label: 'Rating', value: '${rating.toStringAsFixed(1)} ★'),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                  ] else ...[
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
                              style: GoogleFonts.outfit(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ],
                        ),
                        SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            activeTrackColor: AppTheme.primaryColor,
                            inactiveTrackColor: Colors.white.withValues(alpha: 0.1),
                            thumbColor: AppTheme.primaryColor,
                            overlayColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                            trackHeight: 4.0,
                          ),
                          child: Slider(
                            value: _tripRadiusKm,
                            min: 0.5,
                            max: 5.0, 
                            divisions: 9, 
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
                                ? AppTheme.darkSurface 
                                : (_isVerificationInProgress ? Colors.white10 : AppTheme.primaryColor),
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
                                : AppTheme.primaryColor.withValues(alpha: 0.35),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Center(
                        child: (_isLoading || _isVerificationInProgress)
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: AppTheme.primaryColor,
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
          color: Colors.black.withValues(alpha: 0.8),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
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
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.w700,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.outfit(
            color: AppTheme.darkTextSecondary,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}

