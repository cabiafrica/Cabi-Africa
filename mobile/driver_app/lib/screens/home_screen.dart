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
import '../providers/map_provider.dart';
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
  Timer? _ridePollingTimer;

  void _startRidePolling() {
    _ridePollingTimer?.cancel();
    debugPrint('[DRIVER_POLL] Starting ride polling every 3 seconds...');
    _ridePollingTimer = Timer.periodic(const Duration(seconds: 3), (_) async {
      if (!_isOnline || !mounted) return;
      final authState = ref.read(authProvider);
      if (authState is! Authenticated) return;
      final driverProfile = authState.user?['driverProfile'];
      if (driverProfile == null) return;
      final driverId = driverProfile['id'];
      
      final rideReqProvider = legacy_provider.Provider.of<RideRequestProvider>(context, listen: false);
      if (rideReqProvider.currentRideRequest != null) return;

      final rideService = ref.read(rideServiceProvider);
      try {
        final currentRide = await rideService.getCurrentRide(driverId, 'DRIVER');
        if (currentRide != null && mounted) {
          final status = currentRide['status'];
          if (status == 'DRIVER_ASSIGNED' || status == 'REQUESTED') {
            if (rideReqProvider.currentRideRequest == null) {
              debugPrint('[DRIVER_POLL] Incoming ride detected: ${currentRide['id']} (status: $status)');
              final pickup = currentRide['pickupLocation'];
              final dropoff = currentRide['dropoffLocation'];
              final passenger = currentRide['passenger'];

              final formattedRequest = {
                'rideId': currentRide['id'],
                'pickupAddress': (pickup is Map && pickup['address'] != null)
                    ? pickup['address']
                    : (currentRide['pickupAddress'] ?? 'Kenyatta Ave, Nairobi'),
                'dropoffAddress': (dropoff is Map && dropoff['address'] != null)
                    ? dropoff['address']
                    : (currentRide['dropoffAddress'] ?? 'Westlands, Nairobi'),
                'distanceToPickup': '1.5 km',
                'fare': currentRide['fare']?.toString() ?? '350',
                'passengerRating': passenger?['averageRating']?.toString() ?? '5.0',
                'isVerifiedPassenger': passenger?['isVerifiedPassenger'] ?? true,
                'passengerName': passenger?['fullName'] ?? 'Guest Passenger',
              };
              rideReqProvider.setRideRequest(formattedRequest);
            }
          }
        }
      } catch (e) {
        debugPrint('[DRIVER_POLL] Polling error: $e');
      }
    });
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = ref.read(authProvider);
      if (authState is Authenticated) {
        final driverProfile = authState.user?['driverProfile'];
        if (driverProfile != null && mounted) {
          setState(() {
            if (driverProfile['isOnline'] == true) {
              _isOnline = true;
              _startRidePolling();
            }
            if (driverProfile['isBiometricVerified'] == true) {
              _isFaceVerified = true;
            }
          });
        }
      }
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
    if (authState is! Authenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in first to go online.')),
      );
      return;
    }
    
    var driverProfile = authState.user?['driverProfile'];
    if (driverProfile == null) {
      setState(() => _isLoading = true);
      final authService = ref.read(authServiceProvider);
      final res = await authService.getMe(authState.token);
      setState(() => _isLoading = false);
      if (res.user != null) {
        ref.read(authProvider.notifier).updateUser(res.user!);
        driverProfile = res.user!['driverProfile'];
      }
    }

    if (driverProfile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No driver profile found for this account.')),
      );
      return;
    }
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
          _startRidePolling();
        } else {
          _ridePollingTimer?.cancel();
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
    _ridePollingTimer?.cancel();
    _locationSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final mapType = ref.watch(mapProvider);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          CabiMap(
            key: ValueKey('cabi_driver_map_${mapType.name}'),
            initialCenter: _driverLocation,
            initialZoom: 14.0,
            theme: isDark ? CabiMapTheme.dark : CabiMapTheme.light,
            mapSource: mapType == MapType.google
                ? CabiMapSource.googleMaps
                : CabiMapSource.cabiAfrica,
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
                    color: _isOnline ? (theme.cardTheme.color ?? theme.colorScheme.surface) : Colors.black.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: _isOnline
                          ? AppTheme.primaryColor.withValues(alpha: 0.6)
                          : (isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
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
                  icon: Icons.layers_outlined,
                  onTap: () => _showMapSelectionSheet(context, mapType),
                ),
                const SizedBox(width: 8),
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
                color: theme.scaffoldBackgroundColor,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.1),
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
                          color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.directions_car, color: AppTheme.primaryColor, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              "${vehicle['make']} ${vehicle['model']} • ${vehicle['plateNumber']}",
                              style: GoogleFonts.outfit(
                                color: theme.textTheme.bodyLarge?.color?.withValues(alpha: 0.8),
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
                      color: theme.textTheme.bodyLarge?.color,
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
                      color: theme.textTheme.bodyMedium?.color ?? AppTheme.darkTextSecondary,
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
                              style: GoogleFonts.outfit(color: theme.textTheme.bodyLarge?.color, fontWeight: FontWeight.w600, fontSize: 14),
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
                            inactiveTrackColor: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1),
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
                                ? (theme.cardTheme.color ?? theme.colorScheme.surface) 
                                : (_isVerificationInProgress ? (isDark ? Colors.white10 : Colors.black12) : AppTheme.primaryColor),
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

  void _showMapSelectionSheet(BuildContext context, MapType currentMapType) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.layers_outlined, color: AppTheme.primaryColor, size: 22),
                    const SizedBox(width: 10),
                    Text(
                      'SELECT NAVIGATION MAP',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        color: theme.textTheme.titleLarge?.color,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Choose your preferred mapping provider for dispatch & live driving',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: isDark ? Colors.white60 : Colors.black54,
                  ),
                ),
                const SizedBox(height: 20),
                _buildMapOption(
                  context: ctx,
                  type: MapType.google,
                  title: 'Google Maps',
                  subtitle: 'Official Google Maps Platform with high precision satellite & road network',
                  badgeText: 'GLOBAL MAPS',
                  icon: Icons.public,
                  isSelected: currentMapType == MapType.google,
                  onTap: () {
                    ref.read(mapProvider.notifier).setMapType(MapType.google);
                    Navigator.pop(ctx);
                  },
                ),
                const SizedBox(height: 12),
                _buildMapOption(
                  context: ctx,
                  type: MapType.cabi,
                  title: 'Cabi Africa Maps',
                  subtitle: 'Optimized African local roads, informal routes & low data consumption',
                  badgeText: 'LOCAL AFRICA',
                  icon: Icons.explore,
                  isSelected: currentMapType == MapType.cabi,
                  onTap: () {
                    ref.read(mapProvider.notifier).setMapType(MapType.cabi);
                    Navigator.pop(ctx);
                  },
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMapOption({
    required BuildContext context,
    required MapType type,
    required String title,
    required String subtitle,
    required String badgeText,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primaryColor.withValues(alpha: 0.12)
              : (isDark ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.03)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : (isDark ? Colors.white12 : Colors.black12),
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isSelected
                    ? AppTheme.primaryColor.withValues(alpha: 0.2)
                    : (isDark ? Colors.white10 : Colors.black12),
              ),
              child: Icon(
                icon,
                color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white70 : Colors.black54),
                size: 24,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? AppTheme.primaryColor : null,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryColor.withValues(alpha: 0.2)
                              : (isDark ? Colors.white12 : Colors.black12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          badgeText,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white60 : Colors.black54),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
              color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white24 : Colors.black26),
              size: 22,
            ),
          ],
        ),
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
            color: Theme.of(context).textTheme.bodyMedium?.color ?? AppTheme.darkTextSecondary,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}

