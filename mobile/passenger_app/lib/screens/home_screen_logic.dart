part of 'home_screen.dart';

extension HomeScreenLogic on _HomeScreenState {
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
        _updateState(() {
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
        _updateState(() {
          _arrivalDurationMinutes--;
        });
      } else {
        timer.cancel();
        if (mounted) {
          _updateState(() {
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
      _updateState(() {
        _tripDurationSeconds++;
        // Increase distance and fare every second for a more dynamic simulation
        _distanceKm += 0.02; // Smoothly increase distance
        // Dynamic fare: Base + (Dist * Rate) + (Time * Rate)
        // Let's use Cabi Standard rates as prototype: 150 Base + 45/km + 5/min
        _currentFare =
            150.0 + (_distanceKm * 45.0) + ((_tripDurationSeconds / 60) * 5.0);

        // Simulation end condition: after 30 seconds to allow observing the increase
        if (_tripDurationSeconds >= 30) {
          timer.cancel();
          _tripStatus = TripStatus.arrived;
          _showRatingDialog();
        }
      });
    });
  }

  Future<void> _startSearchSimulation() async {
    final authState = ref.read(passengerAuthProvider);
    String? userId;
    if (authState is Authenticated) {
      userId = authState.userId;
    }

    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in to Request a Ride')),
      );
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
          'address': "Current Location"
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
      } else {
        // Fallback to simulation if backend returns mock-ride-id (default fallback in service)
        _runSimulationFallback();
      }
    } catch (e) {
      debugPrint("Error requesting real ride: $e");
      _runSimulationFallback();
    }
  }

  void _runSimulationFallback() {
    if (!mounted) return;
    // Simulate finding a driver after 4 seconds
    Timer(const Duration(seconds: 4), () {
      if (!mounted) return;
      _updateState(() {
        _tripStatus = TripStatus.driverFound;
        _arrivalDurationMinutes = 2; // Arriving in 2 mins
      });
      _startArrivalTimer();
    });
  }

  void _showRatingDialog() {
    double rating = 3.0;
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
                  _updateState(() {
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
        _destination = locationName;
        _dropoffLocation = LatLng(lat, lng);
        if (_pickupLocation == null) {
          _pickupLocation = _passengerLocation;
        }
        // Show service selection panel right after destination is set
        _tripStatus = TripStatus.selectingService;
      });
      _fetchRoadRoute();

      // Center the map to show the dropoff location
      _mapController?.moveCamera(LatLng(lat, lng));
    }
  }
}
