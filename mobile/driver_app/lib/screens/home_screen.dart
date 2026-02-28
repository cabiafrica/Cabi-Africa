import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/ride_service.dart';
import '../services/location_service.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  Timer? _ridePollTimer;
  late final RideService _rideService;
  final _locationService = LocationService();

  // ignore: unused_field
  final Completer<GoogleMapController> _controllerCompleter = Completer();
  GoogleMapController? _googleMapController;
  LatLng? _currentPosition;
  bool _isOnline = false;

  @override
  void initState() {
    super.initState();
    _rideService = ref.read(rideServiceProvider);
    _initLocation();
  }

  @override
  void dispose() {
    _ridePollTimer?.cancel();
    super.dispose();
  }

  Future<void> _initLocation() async {
    try {
      final position = await _locationService.getCurrentLocation();
      if (mounted) {
        setState(() {
          _currentPosition = LatLng(position.latitude, position.longitude);
        });
      }
    } catch (e) {
      debugPrint('Error getting location: $e');
    }
  }

  void _toggleOnlineStatus() {
    setState(() {
      _isOnline = !_isOnline;
      if (_isOnline) {
        _startRidePolling();
      } else {
        _stopRidePolling();
      }
    });
  }

  void _startRidePolling() {
    _ridePollTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _pollForRides();
    });
  }

  void _stopRidePolling() {
    _ridePollTimer?.cancel();
  }

  Future<void> _pollForRides() async {
    // Basic polling logic
    try {
      await _rideService.getCurrentRide("driver-123", "driver");
    } catch (e) {
      debugPrint('Error polling for rides: $e');
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    _googleMapController = controller;
    if (!_controllerCompleter.isCompleted) {
      _controllerCompleter.complete(controller);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map
          if (_currentPosition != null)
            GoogleMap(
              initialCameraPosition: CameraPosition(
                target: _currentPosition!,
                zoom: 14,
              ),
              onMapCreated: _onMapCreated,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
            )
          else
            const Center(child: CircularProgressIndicator()),

          // Online/Offline Toggle
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _isOnline ? 'ONLINE' : 'OFFLINE',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _isOnline ? Colors.green : Colors.grey,
                      ),
                    ),
                    Switch(
                      value: _isOnline,
                      onChanged: (value) => _toggleOnlineStatus(),
                      activeThumbColor: Colors.green,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (_currentPosition != null && _googleMapController != null) {
            _googleMapController!.animateCamera(
              CameraUpdate.newLatLng(_currentPosition!),
            );
          }
        },
        child: const Icon(Icons.my_location),
      ),
    );
  }
}
