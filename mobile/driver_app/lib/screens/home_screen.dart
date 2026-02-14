import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart' as lat_lng;
import 'package:driver_app/providers/map_provider.dart' as provider;
import 'package:driver_app/screens/menu_screen.dart';

import 'package:driver_app/widgets/daily_goals_card.dart';
import 'package:driver_app/widgets/earnings_forecast_card.dart';
import 'package:driver_app/widgets/promotional_carousel.dart';
import 'package:driver_app/widgets/whats_new_banner.dart';
import 'package:driver_app/widgets/swipeable_online_button.dart';
import 'package:driver_app/widgets/sos_button.dart';
import 'package:driver_app/widgets/profile_avatar_with_qr.dart';
import 'package:driver_app/widgets/scanning_radar_map.dart';
import 'package:driver_app/widgets/driver_analytics_cards.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/services/location_service.dart';
import 'package:driver_app/widgets/ride_request_modal.dart';
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/services/badge_service.dart' as badge_service;

// Mock DTO
class DriverHomeStatusDto {
  final bool isOnline;
  DriverHomeStatusDto({required this.isOnline});
}

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  Timer? _ridePollTimer;
  final _rideService = RideService();
  final _locationService = LocationService();

  GoogleMapController? _googleMapController;
  CabiMapController? _cabiMapController;
  LatLng? _currentPosition;
  bool _isFollowingLocation = true;
  StreamSubscription<Position>? _locationSubscription;

  // unused fields removed
  bool _isOnline = false;
  double _radiusInKm = 5.0; // Correctly added
  final DraggableScrollableController _sheetController =
      DraggableScrollableController();

  void _showRadiusSelector() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setStateModal) {
          return Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Set Pick-up Radius',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Receive requests within ${_radiusInKm.toInt()} km',
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    const Text('1 km'),
                    Expanded(
                      child: Slider(
                        value: _radiusInKm,
                        min: 1.0,
                        max: 20.0,
                        divisions: 19,
                        activeColor: const Color(0xFFFFD700), // Taxi Gold
                        label: '${_radiusInKm.toInt()} km',
                        onChanged: (value) {
                          setStateModal(() => _radiusInKm = value);
                          setState(() => _radiusInKm = value); // Update parent
                        },
                      ),
                    ),
                    const Text('20 km'),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFD700), // Taxi Gold
                      foregroundColor: Colors.black,
                    ),
                    child: const Text('Done'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  static const CameraPosition _kInitialPosition = CameraPosition(
    target: LatLng(40.7128, -74.0060), // New York City (Default)
    zoom: 14,
  );

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchStatus();
      _startRidePolling();
      _initLocationTracking();
    });
  }

  Future<void> _initLocationTracking() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    // Get initial position
    final position = await Geolocator.getCurrentPosition();
    if (mounted) {
      setState(() {
        _currentPosition = LatLng(position.latitude, position.longitude);
      });
      _centerMapOnLocation();
    }

    // Subscribe to updates
    _locationSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen((Position position) {
      if (mounted) {
        setState(() {
          _currentPosition = LatLng(position.latitude, position.longitude);
        });
        if (_isFollowingLocation) {
          _centerMapOnLocation();
        }
      }
    });
  }

  void _centerMapOnLocation() {
    if (_currentPosition == null) return;

    final latLng =
        LatLng(_currentPosition!.latitude, _currentPosition!.longitude);

    _googleMapController?.animateCamera(
      CameraUpdate.newLatLngZoom(latLng, 15),
    );

    _cabiMapController?.animateCamera(
      lat_lng.LatLng(latLng.latitude, latLng.longitude),
      zoom: 15,
    );
  }

  @override
  void dispose() {
    _ridePollTimer?.cancel();
    _locationSubscription?.cancel();
    _locationService.dispose();
    super.dispose();
  }

  Future<void> _fetchStatus() async {
    final authState = ref.read(authProvider);
    if (authState is Authenticated && authState.userId != null) {
      final isOnline = await _rideService.getDriverStatus(authState.userId!);
      if (mounted) {
        setState(() {
          _isOnline = isOnline;
        });
      }
    }
  }

  void _startRidePolling() {
    _ridePollTimer?.cancel();
    _ridePollTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _pollForRides();
    });
  }

  Future<void> _pollForRides() async {
    if (!_isOnline) return;

    final authState = ref.read(authProvider);
    if (authState is Authenticated && authState.userId != null) {
      final ride =
          await _rideService.getCurrentRide(authState.userId!, 'DRIVER');

      if (ride != null && mounted) {
        final rideProvider = legacy_provider.Provider.of<RideRequestProvider>(
            context,
            listen: false);
        if (rideProvider.currentRideRequest == null) {
          // Show modal for new assigned ride
          rideProvider.setRideRequest({
            'rideId': ride['id'],
            'pickupAddress': ride['pickupLocation'] is String
                ? ride['pickupLocation']
                : (ride['pickupLocation']?['address'] ?? 'Unspecified Pickup'),
            'distanceToPickup': 'Calculating...',
            'passengerRating': ride['passenger']?['averageRating'] ?? 5.0,
            'passengerBadges':
                (ride['passenger']?['badges'] as List?)?.map((e) {
                      final badgeMap = Map<String, dynamic>.from(e['badge']);
                      badgeMap['isEarned'] = true;
                      return badge_service.Badge.fromJson(badgeMap);
                    }).toList() ??
                    [],
          });

          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => RideRequestModal(
              requestData: rideProvider.currentRideRequest!,
              rideService: _rideService,
              driverId: authState.userId!,
            ),
          );
        }
      }
    }
  }

  Future<void> _toggleOnlineStatus(bool newStatus) async {
    final authState = ref.read(authProvider);
    if (authState is Authenticated && authState.userId != null) {
      await _rideService.toggleOnlineStatus(authState.userId!, newStatus);
      if (mounted) {
        setState(() {
          _isOnline = newStatus;
        });
      }

      if (newStatus) {
        _locationService.init(authState.userId!);
        _locationService.startTracking();
      } else {
        _locationService.goOffline();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Using LayoutBuilder if we needed constraints, but MediaQuery is fine here
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // 1. Full Screen Map
          // 1. Full Screen Map
          // 1. Full Screen Map
          ScanningRadarMap(
            isScanning: _isOnline,
            radiusInKm: 5.0, // Should be dynamic based on settings
            mapWidget: Consumer(
              builder: (context, ref, child) {
                final mapType = ref.watch(provider.mapProvider);
                if (mapType == provider.MapType.cabi) {
                  return CabiMap(
                    initialCenter: _currentPosition != null
                        ? lat_lng.LatLng(_currentPosition!.latitude,
                            _currentPosition!.longitude)
                        : const lat_lng.LatLng(40.7128, -74.0060),
                    initialZoom: 14,
                    onMapCreated: (controller) {
                      _cabiMapController = controller;
                    },
                  );
                }
                return GoogleMap(
                  initialCameraPosition: _currentPosition != null
                      ? CameraPosition(target: _currentPosition!, zoom: 15)
                      : _kInitialPosition,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  mapToolbarEnabled: false,
                  onMapCreated: (controller) {
                    _googleMapController = controller;
                  },
                );
              },
            ),
          ),

          // 2. Top Left Menu
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 16,
            child: FloatingActionButton.small(
              heroTag: 'menu_btn',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const MenuScreen()),
                );
              },
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              elevation: 4,
              child: const Icon(Icons.menu, color: Colors.black),
            ),
          ),

          // 3. Top Right Profile
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            right: 16,
            child: GestureDetector(
              onTap: () {
                // Quick profile access
                Navigator.pushNamed(context, '/profile');
              },
              child: Container(
                decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: const [
                      BoxShadow(color: Colors.black26, blurRadius: 4)
                    ]),
                child: const ProfileAvatarWithQr(
                  radius: 16,
                  imageUrl: 'https://i.pravatar.cc/150?u=driver', // Mock
                  isNetworkImage: true,
                  qrData: 'driver:john_doe_u2973',
                  showQrIcon: false,
                ),
              ),
            ),
          ),

          // 4. Location Tracker & SOS Button
          // SOS Button positioned slightly higher to allow for slide up area
          Positioned(
            right: 16,
            bottom: MediaQuery.of(context).size.height * 0.35 + 80,
            child: SosButton(
              onDistressSignal: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('Distress Signal Sent to Leadership'),
                  backgroundColor: Colors.orange,
                ));
              },
              onEmergencyParams: () {
                showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                          title: const Text("🚨 EMERGENCY ALERT 🚨"),
                          content: const Text(
                              "Security Team Activating...\nLocation Shared with Authorities."),
                          actions: [
                            TextButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: const Text("False Alarm"))
                          ],
                        ));
              },
            ),
          ),

          // Location Button
          Positioned(
            right: 16,
            bottom: MediaQuery.of(context).size.height * 0.35 + 20,
            child: FloatingActionButton.small(
              heroTag: 'location_btn',
              onPressed: () {
                setState(() => _isFollowingLocation = true);
                _centerMapOnLocation();
              },
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              elevation: 4,
              child: const Icon(Icons.my_location, color: Colors.black),
            ),
          ),

          // 5. Draggable Scrollable Sheet
          DraggableScrollableSheet(
            controller: _sheetController,
            initialChildSize: 0.35,
            minChildSize: 0.15,
            maxChildSize: 0.85,
            snap: true,
            builder: (context, scrollController) {
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      spreadRadius: 2,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: ListView(
                  controller: scrollController,
                  padding: EdgeInsets.zero,
                  children: [
                    // Handle
                    Center(
                      child: Container(
                        margin: const EdgeInsets.only(top: 12, bottom: 8),
                        width: 40,
                        height: 5,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),

                    // HEADER: Status Toggle
                    // HEADER: Status Toggle
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 16),
                      child: SwipeableOnlineButton(
                        isOnline: _isOnline,
                        onStatusChanged: _toggleOnlineStatus,
                      ),
                    ),

                    const Divider(),

                    // Active Services & Radius
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Active Services',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black87,
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  _showRadiusSelector(); // Fixed call
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                      color: Colors.grey[100],
                                      borderRadius: BorderRadius.circular(8),
                                      border:
                                          Border.all(color: Colors.grey[300]!)),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.radar,
                                          size: 14, color: Colors.black54),
                                      const SizedBox(width: 4),
                                      Text('${_radiusInKm.toInt()} km',
                                          style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              _buildServiceChip('Standard', true),
                              _buildServiceChip('Cabi XL', true),
                              _buildServiceChip(
                                  'Delivery', false), // Inactive example
                            ],
                          ),
                        ],
                      ),
                    ),

                    const Divider(),

                    const Divider(),

                    // Analytics Section (NEW)
                    const Padding(
                      padding:
                          EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                      child: DriverAnalyticsCards(),
                    ),

                    const SizedBox(height: 8),
                    const Divider(),

                    // Important Widgets Section
                    const Padding(
                      padding: EdgeInsets.fromLTRB(20, 10, 20, 5),
                      child: Text(
                        'Insights',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Colors.black87,
                        ),
                      ),
                    ),

                    // Insights 2-Column Layout
                    // Insights 2-Column Layout
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16.0),
                      child: IntrinsicHeight(
                        // Ensures both cards stretch to same height
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Left Column: Daily Goals
                            Expanded(
                              flex: 5,
                              child: DailyGoalsCard(),
                            ),
                            SizedBox(width: 12),
                            // Right Column: Weekly Forecast
                            Expanded(
                              flex: 4,
                              child: EarningsForecastCard(
                                currentWeekEarnings: 850.25, // Mock
                                daysRemaining: 3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // 3. What's New
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 0.0), // Banner has its own margin
                      child: WhatsNewBanner(
                        title: "New Surge Zones!",
                        description:
                            "Check out the new high demand areas near downtown.",
                        onTap: () {},
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 4. Promotional Carousel
                    const PromotionalCarousel(),

                    const SizedBox(height: 20),

                    const SizedBox(height: 100), // Bottom padding for scrolling
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildServiceChip(String label, bool isActive) {
    return FilterChip(
      label: Text(label),
      selected: isActive,
      onSelected: (bool value) {
        // Logic to toggle service availability
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text('${isActive ? "Disabling" : "Enabling"} $label...')),
        );
        // Note: For full implementation, this should update state map/list
      },
      selectedColor: AppTheme.primaryColor.withValues(alpha: 0.2),
      checkmarkColor: AppTheme.primaryColor,
      labelStyle: TextStyle(
        color: isActive ? Colors.black87 : Colors.grey[600],
        fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
      ),
      backgroundColor: Colors.grey[100],
      side: BorderSide(
        color: isActive ? AppTheme.primaryColor : Colors.grey[300]!,
      ),
    );
  }
}
