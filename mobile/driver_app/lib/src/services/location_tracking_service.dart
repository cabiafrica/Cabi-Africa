import 'dart:async';
import 'package:flutter/foundation.dart';

// Mocking AWS IoT / MQTT client for now
class LocationTrackingService {
  final String driverId;
  Timer? _timer;

  LocationTrackingService({required this.driverId});

  void startTracking() {
    debugPrint("Starting location tracking for driver: $driverId");
    // Simulate periodic updates
    _timer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _publishLocation();
    });
  }

  void stopTracking() {
    debugPrint("Stopping location tracking");
    _timer?.cancel();
  }

  Future<void> _publishLocation() async {
    // In real impl: Get GPS location
    final mockLat = -1.2921 + (DateTime.now().second * 0.0001); // Moving slightly
    const mockLng = 36.8219;

    final payload = {
      'driverId': driverId,
      'lat': mockLat,
      'lng': mockLng,
      'timestamp': DateTime.now().toIso8601String(),
    };

    // In real impl: MqttClient.publish('drivers/$driverId/location', payload);
    debugPrint("[AWS IoT] Published location: $payload");
  }
}
