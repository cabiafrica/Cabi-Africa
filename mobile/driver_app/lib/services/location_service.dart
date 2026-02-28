import '../config/app_config.dart';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class LocationService {
  io.Socket? _socket;
  StreamSubscription<Position>? _positionStreamSubscription;
  String? _driverId;
  String? _activeTripId;

  // Base URL for Dispatch Service
  String get _baseUrl => AppConfig.dispatchSocketUrl;

  void init(String driverId) {
    _driverId = driverId;
    _connectSocket();
  }

  void _connectSocket() {
    // Note: namespace must match backend gateway namespace
    _socket = io.io(
      '$_baseUrl/trip-tracking',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );
    _socket?.connect();
    _socket?.onConnect((_) {
      debugPrint('Location Socket connected: ${_socket?.id}');
      if (_driverId != null) {
        _socket?.emit('driverGoOnline', _driverId);
      }
    });
    _socket?.onDisconnect((_) => debugPrint('Location Socket disconnected'));
    _socket?.onError((data) => debugPrint('Location Socket error: $data'));
  }

  Future<void> startTracking({String? tripId}) async {
    _activeTripId = tripId;

    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('Location services are disabled.');
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('Location permissions are denied');
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('Location permissions are permanently denied');
      return;
    }

    // Cancel existing stream if any
    await _positionStreamSubscription?.cancel();

    // Start stream
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10, // Update every 10 meters
    );

    _positionStreamSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings)
            .listen((Position position) {
      _sendLocationUpdate(position);
    });

    debugPrint('Started location tracking for trip: $tripId');
  }

  void _sendLocationUpdate(Position position) {
    if (_driverId == null || _socket == null) return;

    final payload = {
      'driverId': _driverId,
      'tripId': _activeTripId, // Can be null if just online but not on trip
      'lat': position.latitude,
      'lng': position.longitude,
    };

    _socket?.emit('updateDriverLocation', payload);
    // debugPrint('Location emitted: ${position.latitude}, ${position.longitude}');
  }

  void stopTracking() {
    _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
    _activeTripId = null;
    debugPrint('Stopped location tracking');
  }

  void goOffline() {
    if (_driverId != null && _socket != null) {
      _socket?.emit('driverGoOffline', _driverId);
    }
    stopTracking();
  }

  Future<Position> getCurrentLocation() async {
    return await Geolocator.getCurrentPosition();
  }

  void dispose() {
    goOffline();
    _socket?.disconnect();
    _socket?.dispose();
  }
}
