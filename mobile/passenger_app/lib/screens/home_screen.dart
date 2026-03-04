import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';
import 'package:passenger_app/theme/app_theme.dart';

// Import Screens for Navigation
import 'ride_history_screen.dart';
import 'wallet_screen.dart';
import 'settings_screen.dart';
import 'help_center_screen.dart';
import 'search_screen.dart';
import 'user_dashboard_screen.dart';
import 'package:passenger_app/screens/menu_screen.dart';
import 'package:passenger_app/widgets/promotional_carousel.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import '../providers/auth_provider.dart';
import '../providers/providers.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

enum TripStatus { idle, searching, driverFound, onTrip }

class _HomeScreenState extends ConsumerState<HomeScreen> {
  LatLng? _pickupLocation;
  LatLng? _dropoffLocation;
  bool _isBooking = false;
  String? _selectedVehicleId;
  String? _selectedVehicleType; // STANDARD, PREMIUM, XL, BODA
  int _nearbyDriversCount = 0;
  String _destination = "Where to?"; // Destination state

  TripStatus _tripStatus = TripStatus.idle;
  int _arrivalDurationMinutes = 5;

  CabiMapController? _mapController;
  bool _isFollowingLocation = true;
  StreamSubscription<Position>? _locationSubscription;

  LatLng _passengerLocation =
      const LatLng(-1.286389, 36.817223); // Default Westlands
  final List<Map<String, dynamic>> _vehicleTypes = [
    {
      'id': 'standard',
      'name': 'Standard',
      'price': 'KES 350',
      'time': '5 min',
      'image': 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
      'icon': Icons.local_taxi,
    },
    {
      'id': 'xl',
      'name': 'Cabi XL',
      'price': 'KES 550',
      'time': '8 min',
      'image': 'https://cdn-icons-png.flaticon.com/512/3097/3097135.png',
      'icon': Icons.airport_shuttle,
    },
    {
      'id': 'bany',
      'name': 'Boda',
      'price': 'KES 150',
      'time': '3 min',
      'image': 'https://cdn-icons-png.flaticon.com/512/3097/3097148.png',
      'icon': Icons.two_wheeler,
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
    _selectedVehicleId = _vehicleTypes[0]['id'];
    _selectedVehicleType = 'STANDARD'; // Default vehicle type
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkActiveRide();
      _initLocationTracking();
      _updateNearbyDrivers(); // Fetch nearby drivers on init
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
    try {
      final position = await Geolocator.getCurrentPosition();
      if (mounted) {
        setState(() {
          _passengerLocation = LatLng(position.latitude, position.longitude);
        });
        _centerMapOnLocation();
      }
    } catch (e) {
      debugPrint("Error getting current location: $e");
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
          _passengerLocation = LatLng(position.latitude, position.longitude);
        });
        // Update nearby drivers when location changes significantly (already filtered by distanceFilter)
        _updateNearbyDrivers();

        if (_isFollowingLocation) {
          _centerMapOnLocation();
        }
      }
    });
  }

  void _centerMapOnLocation() {
    _mapController?.animateCamera(
      _passengerLocation,
      zoom: 15.0,
    );
  }

  @override
  void dispose() {
    _rideUpdateTimer?.cancel();
    _arrivalTimer?.cancel();
    _tripTimer?.cancel();
    _locationSubscription?.cancel();
    super.dispose();
  }

  void _checkActiveRide() async {
    final authProvider =
        legacy_provider.Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.userId != null) {
      final rideService = ref.read(rideServiceProvider);
      final ride =
          await rideService.getCurrentRide(authProvider.userId!, 'PASSENGER');
      if (ride != null && mounted) {
        setState(() {
          _currentRideId = ride['id'];
          _updateTripStatusFromBackend(ride);
          _startRideUpdatePolling();
        });
      }
    }
  }

  void _startRideUpdatePolling() {
    _rideUpdateTimer?.cancel();
    _rideUpdateTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _pollRideUpdates();
    });
  }

  void _pollRideUpdates() async {
    if (_currentRideId == null) return;
    final authProvider =
        legacy_provider.Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.userId != null) {
      final rideService = ref.read(rideServiceProvider);
      final ride =
          await rideService.getCurrentRide(authProvider.userId!, 'PASSENGER');
      if (ride != null && mounted) {
        setState(() {
          _updateTripStatusFromBackend(ride);
        });
      }
    }
  }

  void _updateTripStatusFromBackend(Map<String, dynamic> ride) {
    final status = ride['status']?.toString().toUpperCase();
    if (status == 'REQUESTED') {
      _tripStatus = TripStatus.searching;
    } else if (status == 'DRIVER_ASSIGNED') {
      if (_tripStatus != TripStatus.driverFound) {
        _tripStatus = TripStatus.driverFound;
        _arrivalDurationMinutes = 5;
        _startArrivalTimer();
      }
    } else if (status == 'IN_PROGRESS') {
      if (_tripStatus != TripStatus.onTrip) {
        _tripStatus = TripStatus.onTrip;
        _startTripSimulation();
      }
    } else if (status == 'COMPLETED' || status == 'CANCELLED') {
      if (_tripStatus != TripStatus.idle) {
        _tripStatus = TripStatus.idle;
        _currentRideId = null;
        _rideUpdateTimer?.cancel();
        _arrivalTimer?.cancel();
        _tripTimer?.cancel();
      }
    }
  }

  List<CabiMapMarker> _getMarkers() {
    final markers = <CabiMapMarker>[];
    markers.add(CabiMapMarker.passenger(position: _passengerLocation));

    for (var driver in _nearbyDrivers) {
      markers.add(CabiMapMarker.driver(
        position: driver['location'] as LatLng,
        driverId: driver['id'],
        isOnline: true,
      ));
    }

    // Add specific assigned driver marker if driver found
    if (_tripStatus == TripStatus.driverFound) {
      markers.add(CabiMapMarker.driver(
        position: const LatLng(-1.287000, 36.816000), // Mock live driver pos
        driverId: 'assigned-driver',
        isOnline: true,
      ));
    }

    if (_pickupLocation != null) {
      markers.add(CabiMapMarker.pickup(position: _pickupLocation!));
    }
    if (_dropoffLocation != null) {
      markers.add(CabiMapMarker.dropoff(position: _dropoffLocation!));
    }
    return markers;
  }

  List<LatLng>? _getRoute() {
    if (_pickupLocation != null && _dropoffLocation != null) {
      return [_pickupLocation!, _dropoffLocation!];
    }
    return null;
  }

  void _onMapTap(LatLng position) {
    if (_tripStatus != TripStatus.idle) return; // Disable map tap during trip

    if (_pickupLocation == null) {
      setState(() {
        _pickupLocation = _passengerLocation;
        _dropoffLocation = position;
      });
    } else {
      setState(() {
        _dropoffLocation = position;
      });
    }
  }

  Timer? _arrivalTimer;
  Timer? _tripTimer;
  double _currentFare = 350.0;
  double _distanceKm = 0.0;
  int _tripDurationSeconds = 0;
  String? _currentRideId;
  Timer? _rideUpdateTimer;

  void _bookRide() async {
    setState(() => _isBooking = true);

    final rideService = ref.read(rideServiceProvider);
    // Get token from legacy provider
    final authProvider =
        legacy_provider.Provider.of<AuthProvider>(context, listen: false);

    try {
      final response = await rideService.createRide(
        authProvider.userId ?? "passenger-${authProvider.hashCode}",
        {
          'lat': _pickupLocation?.latitude ?? _passengerLocation.latitude,
          'lng': _pickupLocation?.longitude ?? _passengerLocation.longitude,
          'address': 'Pickup Location'
        },
        {
          'lat': _dropoffLocation?.latitude ?? 0.0,
          'lng': _dropoffLocation?.longitude ?? 0.0,
          'address': _destination
        },
        vehicleType: _selectedVehicleType, // Include vehicle type
      );

      if (mounted) {
        setState(() {
          _isBooking = false;
          _currentRideId = response['id'];
          _tripStatus = TripStatus.searching;
          _startRideUpdatePolling();
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isBooking = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Booking Error: $e")),
        );
      }
    }
  }

  void _updateNearbyDrivers() async {
    final rideService = ref.read(rideServiceProvider);
    try {
      final drivers = await rideService.getNearbyDrivers(
        lat: _passengerLocation.latitude,
        lng: _passengerLocation.longitude,
        vehicleType: _selectedVehicleType,
        maxDistanceKm: 5.0,
      );

      if (mounted) {
        setState(() {
          _nearbyDriversCount = drivers.length;
          _nearbyDrivers = drivers.map((d) {
            // Handle location from backend (Map) vs Mock (LatLng)
            final loc = d['location'];
            LatLng position;
            if (loc is LatLng) {
              position = loc;
            } else if (loc is Map) {
              position = LatLng(
                (loc['lat'] as num).toDouble(),
                (loc['lng'] as num).toDouble(),
              );
            } else {
              position = const LatLng(0, 0); // Fallback
            }

            return {
              'id': d['driverId'] ?? d['id'], // Backend uses driverId
              'location': position,
              'vehicleType': d['vehicleType'],
            };
          }).toList();
        });
      }
    } catch (e) {
      // Silently fail - not critical for UX
      debugPrint('Error fetching nearby drivers: $e');
    }
  }

  void _startArrivalTimer() {
    _arrivalTimer?.cancel();
    _arrivalTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (_arrivalDurationMinutes > 1) {
        setState(() {
          _arrivalDurationMinutes--;
        });
      } else {
        timer.cancel();
        if (mounted) {
          setState(() {
            _tripStatus = TripStatus.onTrip;
            _startTripSimulation();
          });
        }
      }
    });
  }

  void _startTripSimulation() {
    _tripTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        _tripDurationSeconds++;
        if (_tripDurationSeconds % 5 == 0) {
          _distanceKm += 0.1;
          _currentFare += (0.1 * 30) + (5 / 60 * 5);
        }
      });
    });
  }

  Future<void> _navigateToSearch() async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const SearchScreen()),
    );

    if (!mounted) return;

    if (result != null && result is Map<String, dynamic>) {
      final String locationName = result['name'];
      setState(() {
        _destination = locationName;
        _dropoffLocation = const LatLng(-1.2921, 36.8219);
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Selected: $locationName")),
      );
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

          // 2. Top Left Menu (Replicating Driver App)
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
                const SizedBox(height: 12),
                FloatingActionButton.small(
                  heroTag: 'sos_btn_passenger',
                  onPressed: () {/* SOS Logic */},
                  backgroundColor: const Color(0xFFD32F2F),
                  foregroundColor: Colors.white,
                  elevation: 4,
                  child: const Text("SOS",
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 10)),
                ),
              ],
            ),
          ),

          // 3. Condition UI: Booking Sheet OR Driver Arriving Panel OR On Trip Panel
          // 3. Condition UI: Booking Sheet OR Driver Arriving Panel OR On Trip Panel
          if (_tripStatus == TripStatus.idle)
            _buildBookingSheet(primaryColor)
          else if (_tripStatus == TripStatus.searching)
            _buildSearchingPanel(primaryColor)
          else if (_tripStatus == TripStatus.driverFound)
            _buildDriverArrivingPanel(primaryColor)
          else if (_tripStatus == TripStatus.onTrip)
            _buildTripInProgressPanel(primaryColor),
        ],
      ),
    );
  }

  Widget _buildDriverArrivingPanel(Color primaryColor) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 20,
                spreadRadius: 5),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Driver found!",
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: Colors.green)),
                    const SizedBox(height: 4),
                    Text("Arriving in $_arrivalDurationMinutes mins",
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14)),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text("$_arrivalDurationMinutes:00",
                      style: const TextStyle(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.bold)),
                )
              ],
            ),
            const Divider(height: 30),

            // Driver Info
            Row(
              children: [
                const CircleAvatar(
                  radius: 25,
                  backgroundImage:
                      NetworkImage('https://i.pravatar.cc/150?u=driver_mike'),
                ),
                const SizedBox(width: 15),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Michael K.",
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16)),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const Text(" 4.9 ",
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        Text("• KCZ 123A • Toyota Axio",
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 13)),
                      ],
                    )
                  ],
                ),
                const Spacer(),
                // Call / Message Actions
                Container(
                  decoration: BoxDecoration(
                      color: Colors.grey[100], shape: BoxShape.circle),
                  child: IconButton(
                      icon: const Icon(Icons.phone, color: Colors.green),
                      onPressed: () {}),
                ),
                const SizedBox(width: 10),
                Container(
                  decoration: BoxDecoration(
                      color: Colors.grey[100], shape: BoxShape.circle),
                  child: IconButton(
                      icon: const Icon(Icons.message, color: Colors.blue),
                      onPressed: () {}),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Cancel Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _tripStatus = TripStatus.idle;
                  });
                },
                style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10))),
                child: const Text("Cancel Ride"),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTripInProgressPanel(Color primaryColor) {
    String formattedTime =
        "${(_tripDurationSeconds ~/ 60).toString().padLeft(2, '0')}:${(_tripDurationSeconds % 60).toString().padLeft(2, '0')}";

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF212121), // Dark Premium Background
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Driver/Trip Header
            Row(
              children: [
                const CircleAvatar(
                  radius: 20,
                  backgroundImage:
                      NetworkImage('https://i.pravatar.cc/150?u=driver_mike'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'On Trip with Michael K.',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16),
                      ),
                      Text(
                        'To: Westlands • ${_distanceKm.toStringAsFixed(1)} km',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color.fromARGB(255, 66, 66, 66),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    formattedTime,
                    style: const TextStyle(
                        color: Color(0xFFFFD700), fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const Divider(color: Colors.white24, height: 24),

            // Live Fare Display
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Current Fare',
                  style: TextStyle(color: Colors.white54, fontSize: 14),
                ),
                Text(
                  'KES ${_currentFare.toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: Color(0xFFFFD700), // Taxi Gold
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Actions
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Estimated Waybill...')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white30),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Waybill'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () {
                      // Share trip logic
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Share Trip Status',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingSheet(Color primaryColor) {
    return DraggableScrollableSheet(
      initialChildSize: 0.50,
      minChildSize: 0.25,
      maxChildSize: 0.88,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.98),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 20,
                  spreadRadius: 5),
            ],
          ),
          child: SingleChildScrollView(
            controller: scrollController,
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle
                Center(
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Destination Picker
                      const Text("Where to?",
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 18)),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            // From Here
                            InkWell(
                              onTap: () {
                                setState(() => _isFollowingLocation = true);
                                _centerMapOnLocation();
                                ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content: Text(
                                            "Location updated to current position")));
                              },
                              child: Row(children: [
                                Icon(Icons.my_location,
                                    color: Colors.blue.shade700, size: 20),
                                const SizedBox(width: 12),
                                const Expanded(
                                  child: Text("From here",
                                      style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500)),
                                ),
                              ]),
                            ),
                            const Divider(height: 20, thickness: 1),
                            // To Where
                            InkWell(
                              onTap: () => _navigateToSearch(),
                              child: Row(
                                children: [
                                  const Icon(Icons.search,
                                      color: Colors.black, size: 24),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      _destination,
                                      style: TextStyle(
                                          fontSize: 18,
                                          fontWeight:
                                              _destination != "Where to?"
                                                  ? FontWeight.bold
                                                  : FontWeight.w500,
                                          color: _destination != "Where to?"
                                              ? Colors.black
                                              : Colors.grey.shade600),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // 2. Choose a ride (Grid Layout)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("Choose a ride",
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 18)),
                          if (_nearbyDriversCount > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.local_taxi,
                                      size: 16, color: Colors.green.shade700),
                                  const SizedBox(width: 4),
                                  Text(
                                    '$_nearbyDriversCount nearby',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.green.shade700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          int crossAxisCount =
                              constraints.maxWidth > 600 ? 3 : 2;
                          if (constraints.maxWidth > 900) crossAxisCount = 4;

                          return GridView.builder(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: crossAxisCount,
                              childAspectRatio: crossAxisCount > 2 ? 1.0 : 1.4,
                              crossAxisSpacing: 10,
                              mainAxisSpacing: 10,
                            ),
                            itemCount: _vehicleTypes.length,
                            itemBuilder: (ctx, index) {
                              final v = _vehicleTypes[index];
                              final isSelected = v['id'] == _selectedVehicleId;
                              return InkWell(
                                onTap: () {
                                  setState(() {
                                    _selectedVehicleId = v['id'];
                                    // Map UI vehicle ID to backend vehicle type
                                    switch (v['id']) {
                                      case 'standard':
                                        _selectedVehicleType = 'STANDARD';
                                        break;
                                      case 'xl':
                                        _selectedVehicleType = 'XL';
                                        break;
                                      case 'bany':
                                        _selectedVehicleType = 'BODA';
                                        break;
                                      default:
                                        _selectedVehicleType = 'STANDARD';
                                    }
                                    _updateNearbyDrivers(); // Refresh nearby drivers count
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? primaryColor.withValues(alpha: 0.15)
                                        : Colors.white,
                                    border: Border.all(
                                        color: isSelected
                                            ? primaryColor
                                            : Colors.grey.shade200,
                                        width: 2),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Align(
                                        alignment: Alignment.centerRight,
                                        child: Image.network(v['image'],
                                            height: 40),
                                      ),
                                      const Spacer(),
                                      Text(v['time'],
                                          style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.green)),
                                      Text(v['name'],
                                          style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold)),
                                      Text(v['price'],
                                          style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey.shade600)),
                                    ],
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),

                      const SizedBox(height: 24),

                      // Request Button
                      if (_selectedVehicleId != null)
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _isBooking ? null : _bookRide,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              foregroundColor: Colors.black,
                              elevation: 4,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16)),
                            ),
                            child: _isBooking
                                ? const CircularProgressIndicator(
                                    color: Colors.white)
                                : const Text("Request Ride",
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold)),
                          ),
                        ),

                      const SizedBox(height: 30),

                      // 3. Discover More
                      const Text("Discover More",
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 18)),
                    ],
                  ),
                ),

                const SizedBox(height: 12),
                const PromotionalCarousel(),
                const SizedBox(height: 30),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSearchingPanel(Color primaryColor) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          children: [
            const SizedBox(height: 10),
            SizedBox(
              height: 60,
              width: 60,
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                strokeWidth: 4,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              "Finding your driver...",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Connecting you to nearby drivers",
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _tripStatus = TripStatus.idle;
                    _isBooking = false;
                  });
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text("Cancel Request"),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                  colors: [AppTheme.primaryColor, AppTheme.secondaryAmber]),
            ),
            accountName: const Text("John Doe",
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.black)),
            accountEmail: const Text("john.doe@example.com",
                style: TextStyle(color: Colors.black87)),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.black,
              child: Text("JD",
                  style: TextStyle(fontSize: 24, color: AppTheme.primaryColor)),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('My Trips'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const RideHistoryScreen())),
          ),
          ListTile(
            leading: const Icon(Icons.payment),
            title: const Text('Wallet & Payment'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const WalletScreen())),
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Settings'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const SettingsScreen())),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('Help & Support'),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const HelpCenterScreen())),
          ),
        ],
      ),
    );
  }
}
