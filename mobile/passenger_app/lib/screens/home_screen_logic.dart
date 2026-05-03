part of 'home_screen.dart';

extension _HomeScreenLogic on _HomeScreenState {
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
        _updateState(() {
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
        _updateState(() {
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

  void _checkActiveRide() async {
    final authState = ref.read(passengerAuthProvider);
    String? userId;
    if (authState is Authenticated) {
      userId = authState.userId;
    }

    if (userId != null) {
      final rideService = ref.read(rideServiceProvider);
      final ride = await rideService.getCurrentRide(userId, 'PASSENGER');
      if (ride != null && mounted) {
        _updateState(() {
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
    final authState = ref.read(passengerAuthProvider);
    String? userId;
    if (authState is Authenticated) {
      userId = authState.userId;
    }

    if (userId != null) {
      final rideService = ref.read(rideServiceProvider);
      final ride = await rideService.getCurrentRide(userId, 'PASSENGER');
      if (ride != null && mounted) {
        _updateState(() {
          _updateTripStatusFromBackend(ride);
        });
      }
    }
  }

  void _updateTripStatusFromBackend(Map<String, dynamic> ride) {
    _currentRideData = ride;
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
          _updateState(() {
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
      _updateState(() {
        _pickupLocation = _passengerLocation;
        _dropoffLocation = position;
      });
      _fetchRoadRoute();
    } else {
      _updateState(() {
        _dropoffLocation = position;
      });
      _fetchRoadRoute();
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
        _updateState(() {
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
      debugPrint('Error fetching nearby drivers: $e');
      if (mounted) {
        _updateState(() {
          _nearbyDrivers = [];
        });
      }
    }
  }

  void _startArrivalTimer() {
    // Wait for real driver status updates from backend instead of timer simulation
  }

  void _startTripSimulation() {
    // Real trip simulation is handled by backend status updates
  }

  Future<void> _startSearchSimulation() async {
    final authState = ref.read(passengerAuthProvider);
    String? userId;
    if (authState is Authenticated) {
      userId = authState.userId;
    }

    if (userId == null) {
      // Use persistent guest ID for unauthenticated requests
      userId = '00000000-0000-0000-0000-000000000000';
    }

    // 1. Identity Gate (MANDATORY FOR REGISTERED USERS, SKIPPED FOR GUESTS)
    bool verified = userId == '00000000-0000-0000-0000-000000000000';
    if (!verified) {
      await showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => SecurityVerificationModal(
          onVerified: () => verified = true,
        ),
      );
    }

    if (!verified) {
      _updateState(() {
        _tripStatus = TripStatus.idle;
      });
      return; 
    }

    _updateState(() {
      _tripStatus = TripStatus.searching;
    });

    try {
      final rideService = ref.read(rideServiceProvider);
      final ride = await rideService.createRide(
        userId,
        {
          'lat': _pickupLocation?.latitude ?? _passengerLocation.latitude,
          'lng': _pickupLocation?.longitude ?? _passengerLocation.longitude,
          'address': _pickupAddress
        },
        {
          'lat': _dropoffLocation!.latitude,
          'lng': _dropoffLocation!.longitude,
          'address': _destination
        },
        vehicleType: _selectedVehicleType,
      );

      if (ride['id'] != 'mock-ride-id') {
        if (mounted) {
          _updateState(() {
            _currentRideId = ride['id'];
          });
          _startRideUpdatePolling();
        }
      }
    } catch (e) {
      debugPrint("Error requesting real ride: $e");
      if (mounted) {
        _updateState(() {
          _tripStatus = TripStatus.idle;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error requesting ride: $e')),
        );
      }
    }
  }


  Future<void> _navigateToSearch({bool isPickup = false}) async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const SearchScreen(),
        settings: RouteSettings(arguments: isPickup),
      ),
    );

    if (!mounted) return;

    if (result != null && result is Map<String, dynamic>) {
      if (result['type'] == 'map_picker') {
        _updateState(() {
          _isPickingFromMap = true;
          _isFollowingLocation = false;
        });
        return;
      }

      final String locationName = result['name'];
      final double lat = result['latitude'];
      final double lng = result['longitude'];
      _updateState(() {
        if (isPickup) {
          _pickupAddress = locationName;
          _pickupLocation = LatLng(lat, lng);
        } else {
          _destination = locationName;
          _dropoffLocation = LatLng(lat, lng);
        }
        
        _pickupLocation ??= _passengerLocation;
        
        // Show service selection panel right after destination is set
        if (_dropoffLocation != null) {
          _tripStatus = TripStatus.selectingService;
        }
      });
      _fetchRoadRoute();

      // Center the map to show the selected location
      _mapController?.moveCamera(LatLng(lat, lng));
    }
  }
}
