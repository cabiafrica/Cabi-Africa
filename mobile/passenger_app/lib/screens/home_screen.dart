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
        _roadRoute = null;
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
    if (_roadRoute != null && _roadRoute!.isNotEmpty) {
      return _roadRoute;
    }
    if (_pickupLocation != null && _dropoffLocation != null) {
      return [_pickupLocation!, _dropoffLocation!]; // fallback
    }
    return null;
  }

  Future<void> _fetchRoadRoute() async {
    if (_pickupLocation == null || _dropoffLocation == null) return;

    try {
      final uri = Uri.parse('https://router.project-osrm.org/route/v1/driving/'
          '${_pickupLocation!.longitude},${_pickupLocation!.latitude};'
          '${_dropoffLocation!.longitude},${_dropoffLocation!.latitude}'
          '?geometries=geojson&overview=full');

      final response = await http.get(uri);
      if (response.statusCode == 200 && mounted) {
        final data = json.decode(response.body);
        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final coordinates =
              data['routes'][0]['geometry']['coordinates'] as List;
          setState(() {
            _roadRoute =
                coordinates.map((coord) => LatLng(coord[1], coord[0])).toList();
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching road route: $e");
    }
  }

  void _onMapTap(LatLng position) {
    if (_tripStatus != TripStatus.idle) return; // Disable map tap during trip

    if (_pickupLocation == null) {
      setState(() {
        _pickupLocation = _passengerLocation;
        _dropoffLocation = position;
      });
      _fetchRoadRoute();
    } else {
      setState(() {
        _dropoffLocation = position;
      });
      _fetchRoadRoute();
    }
  }

  Timer? _arrivalTimer;
  Timer? _tripTimer;
  double _currentFare = 350.0;
  double _distanceKm = 0.0;
  int _tripDurationSeconds = 0;
  String? _currentRideId;
  Timer? _rideUpdateTimer;

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
      // Create realistic mocked driver locations around the passenger's current position so the map populates
      debugPrint('Error fetching nearby drivers, mocking them instead: $e');
      if (mounted) {
        setState(() {
          int numberOfCars = 0;
          switch (_selectedVehicleType) {
            case 'BODA':
              numberOfCars = 8;
              break;
            case 'LITE':
              numberOfCars = 5;
              break;
            case 'STANDARD':
              numberOfCars = 4;
              break;
            case 'XL':
              numberOfCars = 2;
              break;
            default:
              numberOfCars = 3;
          }

          _nearbyDriversCount = numberOfCars;
          _nearbyDrivers = List.generate(numberOfCars, (index) {
            // slightly offset from current passengerLocation
            double latOffset =
                (index.isEven ? 0.001 : -0.001) * (index % 3 + 1);
            double lngOffset =
                (index % 3 == 0 ? 0.0015 : -0.0015) * (index % 2 + 1);

            return {
              'id': 'mock_driver_$index',
              'location': LatLng(
                _passengerLocation.latitude + latOffset,
                _passengerLocation.longitude + lngOffset,
              ),
              'vehicleType': _selectedVehicleType,
            };
          });
        });
      }
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

        // Simulation end condition: after 15 seconds
        if (_tripDurationSeconds >= 15) {
          timer.cancel();
          _tripStatus = TripStatus.arrived;
          _showRatingDialog();
        }
      });
    });
  }

  void _startSearchSimulation() {
    setState(() {
      _tripStatus = TripStatus.searching;
    });

    // Simulate finding a driver after 4 seconds
    Timer(const Duration(seconds: 4), () {
      if (!mounted) return;
      setState(() {
        _tripStatus = TripStatus.driverFound;
        _arrivalDurationMinutes = 2; // Arriving in 2 mins
      });
      _startArrivalTimer();
    });
  }

  void _showRatingDialog() {
    double rating = 5.0;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Column(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 60),
              SizedBox(height: 10),
              Text("Arrived at Destination", textAlign: TextAlign.center),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("How was your ride with Michael K.?",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600)),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < rating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                      size: 40,
                    ),
                    onPressed: () {
                      setDialogState(() => rating = index + 1.0);
                    },
                  );
                }),
              ),
              const SizedBox(height: 10),
              TextField(
                decoration: InputDecoration(
                  hintText: "Extra feedback (optional)",
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                maxLines: 2,
              ),
            ],
          ),
          actions: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  setState(() {
                    _tripStatus = TripStatus.idle;
                    _pickupLocation = null;
                    _dropoffLocation = null;
                    _roadRoute = null;
                    _tripDurationSeconds = 0;
                    _distanceKm = 0.0;
                    _currentFare = 350.0;
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("Submit Rating",
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _navigateToSearch() async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const SearchScreen()),
    );

    if (!mounted) return;

    if (result != null && result is Map<String, dynamic>) {
      if (result['type'] == 'map_picker') {
        setState(() {
          _isPickingFromMap = true;
          _isFollowingLocation = false;
        });
        return;
      }

      final String locationName = result['name'];
      final double lat = result['latitude'];
      final double lng = result['longitude'];
      setState(() {
        _destination = locationName;
        _dropoffLocation = LatLng(lat, lng);
        if (_pickupLocation == null) {
          _pickupLocation = _passengerLocation;
        }
      });
      _fetchRoadRoute();

      // Center the map to show the dropoff location
      _mapController?.moveCamera(LatLng(lat, lng));

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
                        _tripStatus == TripStatus.arrived
                            ? 'Arrived at Destination'
                            : 'On Trip with Michael K.',
                        style: TextStyle(
                            color: _tripStatus == TripStatus.arrived
                                ? Colors.greenAccent
                                : Colors.white,
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
      initialChildSize: 0.95,
      minChildSize: 0.25,
      maxChildSize: 0.95,
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
                      SizedBox(
                        height: 140,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: _vehicleTypes.map((v) {
                            final isSelected = v['id'] == _selectedVehicleId;
                            return Expanded(
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(16),
                                  onTap: () {
                                    setState(() {
                                      _selectedVehicleId = v['id'];
                                      // Map UI vehicle ID to backend vehicle type
                                      switch (v['id']) {
                                        case 'lite':
                                          _selectedVehicleType = 'LITE';
                                          break;
                                        case 'standard':
                                          _selectedVehicleType = 'STANDARD';
                                          break;
                                        case 'xl':
                                          _selectedVehicleType = 'XL';
                                          break;
                                        case 'boda':
                                          _selectedVehicleType = 'BODA';
                                          break;
                                        default:
                                          _selectedVehicleType = 'STANDARD';
                                      }
                                      _updateNearbyDrivers(); // Refresh nearby drivers count
                                    });
                                    _navigateToSearch(); // Immediately trigger search flow for destination entry
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
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
                                              height: 35, fit: BoxFit.contain),
                                        ),
                                        const Spacer(),
                                        Text(v['time'],
                                            style: const TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.green)),
                                        FittedBox(
                                          fit: BoxFit.scaleDown,
                                          alignment: Alignment.centerLeft,
                                          child: Text(v['name'],
                                              style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold)),
                                        ),
                                        FittedBox(
                                          fit: BoxFit.scaleDown,
                                          alignment: Alignment.centerLeft,
                                          child: Text(v['capacity'],
                                              style: TextStyle(
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w500,
                                                  color: Colors.grey.shade700)),
                                        ),
                                        const SizedBox(height: 2),
                                        FittedBox(
                                          fit: BoxFit.scaleDown,
                                          alignment: Alignment.centerLeft,
                                          child: Text(v['price'],
                                              style: TextStyle(
                                                  fontSize: 11,
                                                  color: Colors.grey.shade600)),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // ── Tours & Travel CTA Button ──
                      GestureDetector(
                        onTap: () async {
                          final uri = Uri.parse('https://tours.cabiafrica.com');
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri,
                                mode: LaunchMode.externalApplication);
                          }
                        },
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 18),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF0D7377), Color(0xFF14919B)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0D7377)
                                    .withValues(alpha: 0.4),
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.explore_rounded,
                                  color: Colors.white,
                                  size: 28,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Tours & Travel',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'Book trips, safaris & adventures',
                                      style: TextStyle(
                                        color: Colors.white
                                            .withValues(alpha: 0.85),
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.25),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.arrow_forward_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),

                      // ── Food & Package Delivery Row ──
                      Row(
                        children: [
                          // Food Delivery
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const FoodCheckoutScreen()),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFFE65100),
                                      Color(0xFFFF8F00)
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFFE65100)
                                          .withValues(alpha: 0.3),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color:
                                            Colors.white.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(
                                        Icons.fastfood_rounded,
                                        color: Colors.white,
                                        size: 28,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    const Text(
                                      'Food Delivery',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'Order meals',
                                      style: TextStyle(
                                        color: Colors.white
                                            .withValues(alpha: 0.85),
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Package Delivery
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const DeliveryScreen()),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF4A148C),
                                      Color(0xFF7B1FA2)
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF4A148C)
                                          .withValues(alpha: 0.3),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color:
                                            Colors.white.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(
                                        Icons.inventory_2_rounded,
                                        color: Colors.white,
                                        size: 28,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    const Text(
                                      'Package Delivery',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'Send parcels',
                                      style: TextStyle(
                                        color: Colors.white
                                            .withValues(alpha: 0.85),
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
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
                const SizedBox(height: 20),

                // 4. Request Button (Appears only when destination is set)
                if (_dropoffLocation != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _startSearchSimulation,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 2,
                        ),
                        child: Text(
                          "Confirm ${_vehicleTypes.firstWhere((v) => v['id'] == _selectedVehicleId, orElse: () => _vehicleTypes[0])['name']}",
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
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
                    _roadRoute = null;
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
