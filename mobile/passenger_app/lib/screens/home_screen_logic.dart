part of 'home_screen.dart';

extension _HomeScreenLogic on _HomeScreenState {
  Future<void> _initLocationTracking({bool userInitiated = false}) async {
    bool serviceEnabled = false;
    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
    } catch (_) {
      serviceEnabled = true;
    }

    if (!serviceEnabled) {
      if (mounted) {
        _showLocationPrompt(isServiceDisabled: true);
      }
      return;
    }

    LocationPermission permission = LocationPermission.denied;
    try {
      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (userInitiated && mounted) {
            _showLocationPrompt(isServiceDisabled: false, isPermissionDeniedForever: false);
          }
          return;
        }
      }
    } catch (e) {
      debugPrint("Error checking location permission: $e");
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        _showLocationPrompt(isServiceDisabled: false, isPermissionDeniedForever: true);
      }
      return;
    }

    // Both service and permission are ready! Fetch current high-accuracy position
    try {
      _updateState(() => _isLoadingLocation = true);
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      if (mounted) {
        final currentCoords = LatLng(position.latitude, position.longitude);
        _updateState(() {
          _passengerLocation = currentCoords;
          _pickupLocation = currentCoords;
          _isLoadingLocation = false;
        });
        _centerMapOnLocation();
        _updateNearbyDrivers();

        // Automatically reverse geocode to set pickup address
        _reverseGeocodePickup(currentCoords);
      }
    } catch (e) {
      debugPrint("Error getting current location: $e");
      if (mounted) {
        _updateState(() => _isLoadingLocation = false);
      }
    }

    // Subscribe to continuous location updates
    _locationSubscription?.cancel();
    try {
      _locationSubscription = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen((Position position) {
        if (mounted) {
          final updatedCoords = LatLng(position.latitude, position.longitude);
          _updateState(() {
            _passengerLocation = updatedCoords;
            if (_tripStatus == TripStatus.idle &&
                (_pickupAddress == 'Current Location' || _pickupAddress == 'Where to?' || _pickupAddress.isEmpty)) {
              _pickupLocation = updatedCoords;
            }
          });
          _updateNearbyDrivers();

          if (_isFollowingLocation) {
            _centerMapOnLocation();
          }
        }
      });
    } catch (e) {
      debugPrint("Location stream error: $e");
    }
  }

  Future<void> _reverseGeocodePickup(LatLng coords) async {
    try {
      final address = await GooglePlacesService().reverseGeocode(coords);
      if (address != null && address.isNotEmpty && mounted) {
        _updateState(() {
          final parts = address.split(',');
          if (parts.length > 2) {
            _pickupAddress = '${parts[0].trim()}, ${parts[1].trim()}';
          } else {
            _pickupAddress = address.trim();
          }
        });
      }
    } catch (e) {
      debugPrint("Reverse geocoding error: $e");
    }
  }

  Future<void> _showLocationPrompt({
    required bool isServiceDisabled,
    bool isPermissionDeniedForever = false,
  }) async {
    if (_isPromptingLocation || !mounted) return;
    _isPromptingLocation = true;

    final isDark = Theme.of(context).brightness == Brightness.dark;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF181818) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(
              color: AppTheme.primaryColor.withValues(alpha: 0.5),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.2),
                blurRadius: 28,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Top indicator handle
              Container(
                width: 44,
                height: 5,
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[700] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(10),
                ),
              ),

              // Golden location icon with radiant glow
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.primaryColor.withValues(alpha: 0.12),
                  border: Border.all(
                    color: AppTheme.primaryColor,
                    width: 2.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.35),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.my_location_rounded,
                  size: 38,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(height: 20),

              // Header
              Text(
                isServiceDisabled
                    ? "Enable Location Settings"
                    : (isPermissionDeniedForever
                        ? "Location Permission Needed"
                        : "Allow Location Access"),
                style: AppTheme.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),

              // Description
              Text(
                isServiceDisabled
                    ? "Please activate location settings on your device so Cabi Africa can automatically select your current pickup spot and calculate accurate ETAs."
                    : (isPermissionDeniedForever
                        ? "Location permission is disabled for Cabi Africa. Enable it in App Settings to allow automatic detection of your current location."
                        : "Enable location to automatically set your pickup spot and see available rides closest to you in real time."),
                style: AppTheme.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                  height: 1.45,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 26),

              // Golden Primary Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    Navigator.of(ctx).pop();
                    if (isServiceDisabled) {
                      await Geolocator.openLocationSettings();
                    } else if (isPermissionDeniedForever) {
                      await Geolocator.openAppSettings();
                    } else {
                      await Geolocator.requestPermission();
                    }
                    if (mounted) {
                      Future.delayed(const Duration(milliseconds: 600), () {
                        _initLocationTracking(userInitiated: true);
                      });
                    }
                  },
                  icon: Icon(
                    isServiceDisabled ? Icons.location_on_rounded : Icons.settings_rounded,
                    color: Colors.black,
                    size: 20,
                  ),
                  label: Text(
                    isServiceDisabled
                        ? "Open Location Settings"
                        : (isPermissionDeniedForever ? "Open App Settings" : "Enable Location"),
                    style: AppTheme.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 6,
                    shadowColor: AppTheme.primaryColor.withValues(alpha: 0.5),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Dismiss
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: Text(
                  "Enter Location Manually",
                  style: AppTheme.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );

    _isPromptingLocation = false;
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
    userId ??= '00000000-0000-0000-0000-000000000000';

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
    userId ??= '00000000-0000-0000-0000-000000000000';

    final rideService = ref.read(rideServiceProvider);
    final ride = await rideService.getCurrentRide(userId, 'PASSENGER');
    if (ride != null && mounted) {
      _updateState(() {
        _updateTripStatusFromBackend(ride);
      });
    }
  }

  void _startSearchCountdown() {
    _searchCountdownTimer?.cancel();
    _searchCountdownSeconds = 30;
    _searchCountdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || _tripStatus != TripStatus.searching) {
        timer.cancel();
        return;
      }
      _updateState(() {
        if (_searchCountdownSeconds > 1) {
          _searchCountdownSeconds--;
        } else {
          // Timer finished without finding driver -> auto-restart search wave
          _searchCountdownSeconds = 30;
          AudioNotificationService.instance.play('passenger_ready');
          debugPrint('[SEARCH] Wave search timer expired, auto-restarting 30s countdown...');
        }
      });
    });
  }

  void _resetToIdle() {
    _searchCountdownTimer?.cancel();
    _rideUpdateTimer?.cancel();
    _arrivalTimer?.cancel();
    _tripTimer?.cancel();
    _tripStatus = TripStatus.idle;
    _roadRoute = null;
    _pickupLocation = null;
    _dropoffLocation = null;
    _destination = "Where to?";
    _pickupAddress = "Current Location";
    _currentRideId = null;
    _currentRideData = null;
    _isCancelling = false;
    _searchCountdownSeconds = 30;
    _mapController?.moveCamera(_passengerLocation, zoom: 15.0);
  }

  void _updateTripStatusFromBackend(Map<String, dynamic> ride) {
    _currentRideData = ride;
    final status = ride['status']?.toString().toUpperCase();
    if (status == 'REQUESTED') {
      if (_tripStatus != TripStatus.searching) {
        _tripStatus = TripStatus.searching;
        _startSearchCountdown();
      }
    } else if (status == 'DRIVER_ASSIGNED' || status == 'ACCEPTED') {
      _searchCountdownTimer?.cancel();
      if (_tripStatus != TripStatus.driverFound) {
        _tripStatus = TripStatus.driverFound;
        _arrivalDurationMinutes = 5;
        AudioNotificationService.instance.play('driver_matched');
        _startArrivalTimer();
      }
    } else if (status == 'ARRIVED') {
      _searchCountdownTimer?.cancel();
      if (_tripStatus != TripStatus.arrived) {
        _tripStatus = TripStatus.arrived;
        AudioNotificationService.instance.play('driver_arrived');
      }
    } else if (status == 'IN_PROGRESS') {
      _searchCountdownTimer?.cancel();
      if (_tripStatus != TripStatus.onTrip) {
        _tripStatus = TripStatus.onTrip;
        AudioNotificationService.instance.play('trip_started');
        _startTripSimulation();
      }
    } else if (status == 'COMPLETED' || status == 'CANCELLED') {
      if (_tripStatus != TripStatus.idle) {
        final completedRideId = _currentRideId ?? ride['id']?.toString() ?? '';
        final driverName = ride['driver']?['user']?['fullName']?.toString() ?? 'Your Driver';
        final wasCompleted = status == 'COMPLETED';

        AudioNotificationService.instance.play(wasCompleted ? 'trip_ended' : 'passenger_cancelled');

        if (wasCompleted && completedRideId.isNotEmpty && mounted) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => RateDriverScreen(
                    rideId: completedRideId,
                    driverName: driverName,
                  ),
                ),
              ).then((_) {
                if (mounted) {
                  _updateState(() {
                    _resetToIdle();
                  });
                }
              });
            }
          });
        } else {
          _resetToIdle();
        }
      }
    }
  }

  List<CabiMapMarker> _getMarkers() {
    final markers = <CabiMapMarker>[];
    final isSearching = _tripStatus == TripStatus.searching;

    // Show radar on pickup if specified, otherwise on passenger live position
    final showPassengerRadar = isSearching && _pickupLocation == null;
    final showPickupRadar = isSearching && _pickupLocation != null;

    markers.add(CabiMapMarker.passenger(
      position: _passengerLocation,
      showRadar: showPassengerRadar,
      radiusKm: 5.0,
      radarLabel: 'FINDING NEARBY DRIVERS',
    ));

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
      markers.add(CabiMapMarker.pickup(
        position: _pickupLocation!,
        showRadar: showPickupRadar,
        radiusKm: 5.0,
        radarLabel: 'FINDING NEARBY DRIVERS',
      ));
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

    // Use persistent guest ID for unauthenticated requests
    userId ??= '00000000-0000-0000-0000-000000000000';

    // 1. One-Time Identity & Passenger Biometric Gate (Configured on install)
    final isBiometricConfigured = await PassengerBiometricService.isConfigured();
    bool verified = isBiometricConfigured;
    VerificationMethod chosenMethod = isBiometricConfigured
        ? PassengerBiometricService.methodFromString(await PassengerBiometricService.getPreferredMethod())
        : VerificationMethod.face;

    if (!isBiometricConfigured) {
      final user = (authState is Authenticated) ? authState.user : null;
      final userPhone = user?['phone']?.toString();
      final userName = user?['firstName'] != null
          ? "${user?['firstName']} ${user?['lastName'] ?? ''}".trim()
          : user?['name']?.toString();

      if (!mounted) return;
      await showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        enableDrag: false,
        builder: (context) => SecurityVerificationModal(
          isFirstTimeSetup: true,
          onVerified: () => verified = true,
          onVerifiedDetails: (method, selfie) {
            verified = true;
            chosenMethod = method;
          },
          userPhone: userPhone,
          userName: userName,
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
    _startSearchCountdown();
    AudioNotificationService.instance.play('passenger_ready');

    final searchCenter = _pickupLocation ?? _passengerLocation;
    _mapController?.moveCamera(searchCenter, zoom: 15.0);

    final methodCode = chosenMethod == VerificationMethod.face
        ? 'FACE_RECOGNITION'
        : (chosenMethod == VerificationMethod.fingerprint ? 'FINGERPRINT' : 'OTP');

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
        isVerifiedPassenger: true,
        verificationMethod: methodCode,
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
        _searchCountdownTimer?.cancel();
        _updateState(() {
          _tripStatus = TripStatus.selectingService;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error requesting ride: $e')),
        );
      }
    }
  }

  Future<void> _cancelRideSearch() async {
    if (_isCancelling) return;
    _isCancelling = true;

    final rideIdToCancel = _currentRideId;

    // Immediately stop search countdown timer and polling
    _searchCountdownTimer?.cancel();
    _rideUpdateTimer?.cancel();
    _arrivalTimer?.cancel();
    _tripTimer?.cancel();

    // Redirect to choose a service panel, preserving user's route, pickup & dropoff
    _updateState(() {
      _tripStatus = TripStatus.selectingService;
      _currentRideId = null;
      _currentRideData = null;
      _searchCountdownSeconds = 30;
    });

    // Re-center map to show the route between pickup and destination
    if (_pickupLocation != null && _dropoffLocation != null) {
      _mapController?.fitBounds(
        [_pickupLocation!, _dropoffLocation!],
        padding: 60.0,
      );
    } else {
      _mapController?.moveCamera(_pickupLocation ?? _passengerLocation, zoom: 15.0);
    }

    // Cancel on backend if ride was created
    if (rideIdToCancel != null && rideIdToCancel != 'mock-ride-id') {
      try {
        final rideService = ref.read(rideServiceProvider);
        await rideService.cancelRide(
          rideIdToCancel,
          reason: 'Passenger cancelled to choose a different service tier',
        );
      } catch (e) {
        debugPrint('Error notifying backend of ride cancellation: $e');
      }
    }

    _isCancelling = false;

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.swap_horiz_rounded, color: AppTheme.primaryLight, size: 20),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Driver search cancelled. Please choose another service tier.',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          duration: const Duration(seconds: 3),
          backgroundColor: const Color(0xFF1E1E1E),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }


  Future<void> _navigateToSearch({bool isPickup = false}) async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => SearchScreen(
          isPickup: isPickup,
          userLocation: _passengerLocation,
          currentAddress: isPickup ? _pickupAddress : _destination,
        ),
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

      if (result['type'] == 'route') {
        final pickup = result['pickup'] as Map<String, dynamic>?;
        final dropoff = result['dropoff'] as Map<String, dynamic>?;

        _updateState(() {
          if (pickup != null) {
            _pickupAddress = pickup['name'] ?? _pickupAddress;
            _pickupLocation = LatLng(pickup['latitude'], pickup['longitude']);
          }
          if (dropoff != null) {
            _destination = dropoff['name'] ?? _destination;
            _dropoffLocation = LatLng(dropoff['latitude'], dropoff['longitude']);
            _tripStatus = TripStatus.selectingService;
          }
          _pickupLocation ??= _passengerLocation;
        });

        _fetchRoadRoute();
        if (_dropoffLocation != null) {
          _mapController?.moveCamera(_dropoffLocation!);
        }
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
