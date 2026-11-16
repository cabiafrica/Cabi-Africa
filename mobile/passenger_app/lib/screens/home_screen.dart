import 'dart:async';
import 'dart:convert';
import 'dart:ui';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:core_ui/core_ui.dart';

// Import Screens for Navigation
import 'ride_history_screen.dart';
import 'wallet_screen.dart';
import 'settings_screen.dart';
import 'help_center_screen.dart';
import 'search_screen.dart';
import 'food_checkout_screen.dart';
import 'delivery_screen.dart';
import 'user_dashboard_screen.dart';
import 'scheduled_rides_screen.dart';
import 'package:passenger_app/screens/menu_screen.dart';
import 'package:passenger_app/widgets/promotional_carousel.dart';
import 'package:passenger_app/widgets/profile_avatar_with_qr.dart';
import 'rate_driver_screen.dart';
// import 'login_screen.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/providers.dart';
import '../widgets/security_verification_modal.dart';
import '../widgets/sos_button.dart';
import '../services/audio_notification_service.dart';
import '../services/passenger_biometric_service.dart';
part 'home_screen_panels.dart';
part 'home_screen_logic.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

enum TripStatus {
  idle,
  selectingService,
  searching,
  driverFound,
  onTrip,
  arrived
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  LatLng? _pickupLocation;
  LatLng? _dropoffLocation;
  String? _selectedVehicleId;
  String? _selectedVehicleType; // STANDARD, PREMIUM, XL, BODA

  String _destination = "Where to?"; // Destination state
  String _pickupAddress = "Current Location"; // Pickup address state
  List<LatLng>? _roadRoute; // Dynamically fetched road trace

  TripStatus _tripStatus = TripStatus.idle;
  int _arrivalDurationMinutes = 5;
  int _searchCountdownSeconds = 30;
  Timer? _searchCountdownTimer;

  CabiMapController? _mapController;
  bool _isFollowingLocation = true;
  bool _isPickingFromMap = false;
  StreamSubscription<Position>? _locationSubscription;

  Timer? _arrivalTimer;
  Timer? _tripTimer;
  final double _currentFare = 0.0;
  final double _distanceKm = 0.0;
  final int _tripDurationSeconds = 0;
  String? _currentRideId;
  Map<String, dynamic>? _currentRideData;
  Timer? _rideUpdateTimer;
  Timer? _autoSimTimer;
  bool _isCancelling = false;
  bool _isFullScreenMap = false;
  bool _isForSomeone = false;
  String _recipientName = '';
  String _recipientPhone = '';
  String _recipientNotes = '';
  String? _intermediateStop;

  void _swapLocations() {
    setState(() {
      final prevPickupAddr = _pickupAddress;
      final prevDestAddr = _destination;
      if (prevDestAddr == "Where to?") return;
      _pickupAddress = prevDestAddr;
      _destination = prevPickupAddr;
      final prevPickupLoc = _pickupLocation;
      _pickupLocation = _dropoffLocation;
      _dropoffLocation = prevPickupLoc;
    });
  }

  void _exitFullScreenMap() {
    setState(() {
      _isFullScreenMap = false;
    });
  }

  LatLng _passengerLocation =
      const LatLng(-1.286389, 36.817223); // Default Westlands
  bool _isPromptingLocation = false;
  bool _isLoadingLocation = false;
  final List<Map<String, dynamic>> _vehicleTypes = [
    {
      'id': 'boda',
      'name': 'Cabi Boda',
      'color': Color(0xFF10B981),
      'tag': 'Speedy',
      'time': '3 min',
      'image': 'assets/images/boda.png',
      'icon': Icons.two_wheeler_rounded,
      'capacity': '1 Pax',
    },
    {
      'id': 'standard',
      'name': 'CabiGo',
      'color': Color(0xFFE5A93C),
      'tag': 'Affordable',
      'time': '4 min',
      'image': 'assets/images/standard.png',
      'icon': Icons.directions_car_rounded,
      'capacity': '4 Pax',
    },
    {
      'id': 'comfort',
      'name': 'CabiX Comfort',
      'color': Color(0xFF0284C7),
      'tag': 'Executive',
      'time': '5 min',
      'image': 'assets/images/lite.png',
      'icon': Icons.airline_seat_recline_extra_rounded,
      'capacity': '4 Pax',
    },
    {
      'id': 'lux',
      'name': 'Cabi Lux',
      'color': Color(0xFFD4AF37),
      'tag': 'VIP Chauffeur',
      'time': '7 min',
      'image': 'assets/images/xl.png',
      'icon': Icons.local_taxi_rounded,
      'capacity': '4 Pax',
    },
  ];

  List<Map<String, dynamic>> _nearbyDrivers = [];
  final List<Map<String, dynamic>> _favouriteDestinations = [];
  final List<Map<String, dynamic>> _recentPlaces = [];

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
    _searchCountdownTimer?.cancel();
    _rideUpdateTimer?.cancel();
    _arrivalTimer?.cancel();
    _tripTimer?.cancel();
    _locationSubscription?.cancel();
    super.dispose();
  }

  void _updateState(VoidCallback fn) {
    if (mounted) {
      setState(fn);
    }
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
                      _pickupLocation ??= _passengerLocation;
                    });
                    _fetchRoadRoute();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  elevation: 8,
                  shadowColor: AppTheme.primaryColor.withValues(alpha: 0.4),
                ),
                child: const Text("Confirm Location",
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black)),
              ),
            ),

          // 2. Top Left Header: Menu Button + Stitch Day/Night Dual-Theme Toggle Pill
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 16,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                FloatingActionButton.small(
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
                  backgroundColor: Theme.of(context).brightness == Brightness.dark
                      ? AppTheme.surfaceContainerHigh
                      : Colors.white,
                  foregroundColor: Theme.of(context).brightness == Brightness.dark
                      ? AppTheme.primaryColor
                      : Colors.black,
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? AppTheme.outlineGold
                          : AppTheme.porcelainOutline,
                    ),
                  ),
                  child: Icon(_isPickingFromMap ? Icons.arrow_back : Icons.menu),
                ),
              ],
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
                      ProfileAvatarWithQr(
                        user: () {
                          final authState = ref.watch(passengerAuthProvider);
                          return authState is Authenticated ? authState.user : null;
                        }(),
                        radius: 20,
                        showQrIcon: false,
                        qrData: '',
                      ),
                      if (() {
                        final authState = ref.watch(passengerAuthProvider);
                        if (authState is Authenticated) {
                          return authState.user?['isIdentityVerified'] != true;
                        }
                        return true;
                      }())
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
                if (!_isPickingFromMap) const SizedBox(height: 14),
                if (!_isPickingFromMap)
                  const SOSButton(size: 46),
                if (!_isPickingFromMap) const SizedBox(height: 14),
                if (!_isPickingFromMap)
                  FloatingActionButton.small(
                    heroTag: 'fullscreen_toggle_passenger',
                    onPressed: () {
                      setState(() {
                        _isFullScreenMap = !_isFullScreenMap;
                      });
                    },
                    backgroundColor: Theme.of(context).brightness == Brightness.dark
                        ? AppTheme.surfaceContainer
                        : Colors.white,
                    foregroundColor: _isFullScreenMap ? AppTheme.primaryColor : AppTheme.darkTextSecondary,
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? AppTheme.outlineBorder
                            : AppTheme.porcelainOutline,
                      ),
                    ),
                    tooltip: _isFullScreenMap ? "Exit Fullscreen" : "Full Screen Map",
                    child: Icon(
                      _isFullScreenMap ? Icons.fullscreen_exit_rounded : Icons.fullscreen_rounded,
                      size: 22,
                      color: _isFullScreenMap ? AppTheme.primaryColor : null,
                    ),
                  ),
                if (!_isPickingFromMap) const SizedBox(height: 14),
                if (!_isPickingFromMap)
                  FloatingActionButton.small(
                    heroTag: 'my_location_btn_passenger',
                    onPressed: () => _initLocationTracking(userInitiated: true),
                    backgroundColor: Theme.of(context).brightness == Brightness.dark
                        ? AppTheme.surfaceContainer
                        : Colors.white,
                    foregroundColor: AppTheme.primaryColor,
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? AppTheme.outlineBorder
                            : AppTheme.porcelainOutline,
                      ),
                    ),
                    tooltip: "My Location",
                    child: _isLoadingLocation
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                            ),
                          )
                        : const Icon(Icons.my_location_rounded, size: 20, color: AppTheme.primaryColor),
                  ),
              ],
            ),
          ),

          // 3. Condition UI: Full Screen Mini Bar OR Booking Sheet OR Driver Arriving Panel OR On Trip Panel
          if (_isFullScreenMap)
            _buildFullScreenFloatingBar(primaryColor)
          else if (_tripStatus == TripStatus.idle && !_isPickingFromMap) ...[
            Positioned(
              top: MediaQuery.of(context).padding.top + 14,
              left: 72,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: (Theme.of(context).brightness == Brightness.dark
                          ? AppTheme.surfaceContainer
                          : Colors.white)
                      .withValues(alpha: 0.92),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppTheme.outlineGold),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.bolt_rounded, size: 14, color: AppTheme.primaryColor),
                    const SizedBox(width: 4),
                    Text(
                      '1.2x Westlands Peak',
                      style: AppTheme.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? AppTheme.primaryLight
                            : AppTheme.aurumBronze,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _buildBookingSheet(primaryColor),
          ]
          else if (_tripStatus == TripStatus.selectingService)
            _buildServiceSelectionPanel(primaryColor)
          else if (_tripStatus == TripStatus.searching)
            _buildSearchingPanel(primaryColor)
          else if (_tripStatus == TripStatus.driverFound)
            _buildDriverArrivingPanel(primaryColor)
          else if (_tripStatus == TripStatus.onTrip ||
              _tripStatus == TripStatus.arrived)
            _buildTripInProgressPanel(primaryColor),
        ],
      ),
      bottomNavigationBar: (_tripStatus == TripStatus.idle &&
              !_isFullScreenMap &&
              !_isPickingFromMap)
          ? Container(
              decoration: BoxDecoration(
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppTheme.obsidianCanvas
                    : AppTheme.porcelainCanvas,
                border: Border(
                  top: BorderSide(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppTheme.outlineBorder
                        : AppTheme.porcelainOutline,
                  ),
                ),
              ),
              child: BottomNavigationBar(
                currentIndex: 0,
                type: BottomNavigationBarType.fixed,
                backgroundColor: Colors.transparent,
                elevation: 0,
                selectedItemColor: AppTheme.primaryColor,
                unselectedItemColor: Theme.of(context).brightness == Brightness.dark
                    ? AppTheme.warmStone
                    : AppTheme.porcelainTextSecondary,
                selectedLabelStyle: AppTheme.inter(fontSize: 11, fontWeight: FontWeight.w700),
                unselectedLabelStyle: AppTheme.inter(fontSize: 11, fontWeight: FontWeight.w500),
                onTap: (index) {
                  if (index == 1) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const RideHistoryScreen()),
                    );
                  } else if (index == 2) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Safety Center • Cabi Secure PIN active')),
                    );
                  } else if (index == 3) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const UserDashboardScreen()),
                    );
                  }
                },
                items: const [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.directions_car_rounded),
                    label: 'Ride',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.schedule_rounded),
                    label: 'Activity',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.verified_user_rounded),
                    label: 'Safety',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.person_outline_rounded),
                    label: 'Account',
                  ),
                ],
              ),
            )
          : null,
    );
  }
}
