import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

// Import Screens for Navigation
import 'ride_history_screen.dart';
import 'wallet_screen.dart';
import 'settings_screen.dart';
import 'help_center_screen.dart';
import 'search_screen.dart';
import 'food_checkout_screen.dart';
import 'delivery_screen.dart';
import 'user_dashboard_screen.dart';
import 'package:passenger_app/screens/menu_screen.dart';
import 'package:passenger_app/widgets/promotional_carousel.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import '../providers/auth_provider.dart';
import '../providers/providers.dart';
part 'home_screen_panels.dart';
part 'home_screen_logic.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

enum TripStatus { idle, searching, driverFound, onTrip, arrived }

class _HomeScreenState extends ConsumerState<HomeScreen> {
  LatLng? _pickupLocation;
  LatLng? _dropoffLocation;
  String? _selectedVehicleId;
  String? _selectedVehicleType; // STANDARD, PREMIUM, XL, BODA
  int _nearbyDriversCount = 0;
  String _destination = "Where to?"; // Destination state
  List<LatLng>? _roadRoute; // Dynamically fetched road trace

  TripStatus _tripStatus = TripStatus.idle;
  int _arrivalDurationMinutes = 5;

  CabiMapController? _mapController;
  bool _isFollowingLocation = true;
  bool _isPickingFromMap = false;
  StreamSubscription<Position>? _locationSubscription;

  Timer? _arrivalTimer;
  Timer? _tripTimer;
  double _currentFare = 350.0;
  double _distanceKm = 0.0;
  int _tripDurationSeconds = 0;
  String? _currentRideId;
  Timer? _rideUpdateTimer;

  LatLng _passengerLocation =
      const LatLng(-1.286389, 36.817223); // Default Westlands
  final List<Map<String, dynamic>> _vehicleTypes = [
    {
      'id': 'boda',
      'name': 'Boda',
      'price': 'KES 150',
      'time': '3 min',
      'image':
          'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_956,h_637/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png',
      'icon': Icons.two_wheeler,
      'capacity': '1 Pax',
    },
    {
      'id': 'lite',
      'name': 'Cabi Lite',
      'price': 'KES 250',
      'time': '4 min',
      'image':
          'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1568070387/assets/b5/0a5191-836e-42bf-ad5d-6cb3100ec4ea/original/UberX.png',
      'icon': Icons.directions_car,
      'capacity': '3 Pax',
    },
    {
      'id': 'standard',
      'name': 'Cabi Standard',
      'price': 'KES 350',
      'time': '5 min',
      'image':
          'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1690807720/assets/a5/9986ad-0d9f-4396-8539-389bce97f579/original/UberX-ShareIcon.png',
      'icon': Icons.local_taxi,
      'capacity': '4 Pax',
    },
    {
      'id': 'xl',
      'name': 'Cabi XL',
      'price': 'KES 550',
      'time': '8 min',
      'image':
          'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1569012915/assets/4f/599c47-7f5c-4544-a5d2-926babc8e113/original/UberXL.png',
      'icon': Icons.airport_shuttle,
      'capacity': '7 Pax',
    },
  ];

  List<Map<String, dynamic>> _nearbyDrivers = [
    {
      'id': 'drv-001',
      'location': const LatLng(-1.288000, 36.815000),
    },
    {
      'id': 'drv-002',
      'location': const LatLng(-1.284000, 36.820000),
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedVehicleId = 'standard'; // 'standard' is default
    _selectedVehicleType = 'STANDARD'; // Default vehicle type
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkActiveRide();
      _initLocationTracking();
      _updateNearbyDrivers(); // Fetch nearby drivers on init
    });
  }

  @override
  void dispose() {
    _rideUpdateTimer?.cancel();
    _arrivalTimer?.cancel();
    _tripTimer?.cancel();
    _locationSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    debugPrint("HomeScreen: building widget tree...");
    const primaryColor = AppTheme.primaryColor;

    return Scaffold(
      extendBodyBehindAppBar: true,
      drawer: _buildDrawer(),
      body: Stack(
        children: [
          // 1. Full Screen Map
          CabiMap(
            initialCenter: _passengerLocation,
            initialZoom: 15.0,
            theme: Theme.of(context).brightness == Brightness.dark
                ? CabiMapTheme.dark
                : CabiMapTheme.light,
            markers: _getMarkers(),
            routePoints: _getRoute(),
            showUserLocation: true,
            onTap: _onMapTap,
            onMapCreated: (controller) {
              _mapController = controller;
            },
          ),

          // Central Pin overlay when picking from map
          if (_isPickingFromMap)
            IgnorePointer(
              child: Center(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 40),
                  child: Icon(Icons.location_on,
                      size: 45, color: Colors.blue.shade700),
                ),
              ),
            ),

          // Confirm Button when picking from map
          if (_isPickingFromMap)
            Positioned(
              bottom: 40,
              left: 20,
              right: 20,
              child: ElevatedButton(
                onPressed: () {
                  if (_mapController != null) {
                    final center = _mapController!.center;
                    setState(() {
                      _isPickingFromMap = false;
                      _destination = "Dropped Pin";
                      _dropoffLocation = center;
                      if (_pickupLocation == null) {
                        _pickupLocation = _passengerLocation;
                      }
                    });
                    _fetchRoadRoute();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  elevation: 8,
                ),
                child: const Text("Confirm Location",
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),

          // 2. Top Left Menu (Replicating Driver App)
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 16,
            child: FloatingActionButton.small(
              heroTag: 'menu_btn',
              onPressed: () {
                if (_isPickingFromMap) {
                  setState(() => _isPickingFromMap = false);
                  _navigateToSearch();
                } else {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const MenuScreen()),
                  );
                }
              },
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              elevation: 4,
              child: Icon(_isPickingFromMap ? Icons.arrow_back : Icons.menu,
                  color: Colors.black),
            ),
          ),

          // 3. Top Right Profile (Replicating Driver App)
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            right: 16,
            child: Column(
              children: [
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const UserDashboardScreen()),
                    );
                  },
                  child: Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: const [
                              BoxShadow(color: Colors.black26, blurRadius: 4)
                            ]),
                        child: CircleAvatar(
                          radius: 20,
                          backgroundColor: Colors.grey[300],
                          backgroundImage: (legacy_provider.Provider.of<
                                          AuthProvider>(context)
                                      .user?['passportPhotoUrl'] !=
                                  null)
                              ? NetworkImage(
                                  legacy_provider.Provider.of<AuthProvider>(
                                          context)
                                      .user!['passportPhotoUrl'])
                              : (legacy_provider.Provider.of<AuthProvider>(
                                              context)
                                          .user?['isIdentityVerified'] ==
                                      true
                                  ? const NetworkImage(
                                      'https://i.pravatar.cc/150?u=passenger') // Fallback valid
                                  : null), // Blank if not verified and no photo
                          child: (legacy_provider.Provider.of<AuthProvider>(
                                              context)
                                          .user?['passportPhotoUrl'] ==
                                      null &&
                                  legacy_provider.Provider.of<AuthProvider>(
                                              context)
                                          .user?['isIdentityVerified'] !=
                                      true)
                              ? const Icon(Icons.person, color: Colors.grey)
                              : null,
                        ),
                      ),
                      if (legacy_provider.Provider.of<AuthProvider>(context)
                              .user?['isIdentityVerified'] !=
                          true)
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 10,
                              minHeight: 10,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                if (!_isPickingFromMap) const SizedBox(height: 12),
                if (!_isPickingFromMap)
                  FloatingActionButton.small(
                    heroTag: 'sos_btn_passenger',
                    onPressed: () {/* SOS Logic */},
                    backgroundColor: const Color(0xFFD32F2F),
                    foregroundColor: Colors.white,
                    elevation: 4,
                    child: const Text("SOS",
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 10)),
                  ),
              ],
            ),
          ),

          // 3. Condition UI: Booking Sheet OR Driver Arriving Panel OR On Trip Panel
          // 3. Condition UI: Booking Sheet OR Driver Arriving Panel OR On Trip Panel
          if (_tripStatus == TripStatus.idle && !_isPickingFromMap)
            _buildBookingSheet(primaryColor)
          else if (_tripStatus == TripStatus.searching)
            _buildSearchingPanel(primaryColor)
          else if (_tripStatus == TripStatus.driverFound)
            _buildDriverArrivingPanel(primaryColor)
          else if (_tripStatus == TripStatus.onTrip ||
              _tripStatus == TripStatus.arrived)
            _buildTripInProgressPanel(primaryColor),
        ],
      ),
    );
  }
}
