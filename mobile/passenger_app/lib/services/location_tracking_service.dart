import 'dart:async';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:geolocator/geolocator.dart';

/// A service to handle real-time location tracking for the driver.
class LocationTrackingService {
  Timer? _locationUpdateTimer;

  /// Starts periodically publishing the driver's location.
  void startTracking(String driverId) {
    // Stop any existing timers to prevent duplicates
    stopTracking();

    _locationUpdateTimer = Timer.periodic(const Duration(seconds: 10), (
      timer,
    ) async {
      try {
        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        _publishLocation(driverId, position);
      } catch (e) {
        safePrint('Error getting location for tracking: $e');
      }
    });
  }

  /// Stops the periodic location updates.
  void stopTracking() {
    _locationUpdateTimer?.cancel();
    _locationUpdateTimer = null;
  }

  /// Publishes the location to the backend via a GraphQL mutation.
  /// The backend API would be configured with `@aws_subscribe` to push this
  /// mutation to subscribers on AWS IoT Core.
  Future<void> _publishLocation(String driverId, Position position) async {
    final mutation = '''
      mutation UpdateDriverLocation {
        updateDriverLocation(driverId: "$driverId", lat: ${position.latitude}, lon: ${position.longitude}) {
          driverId
          lat
          lon
        }
      }
    ''';

    final request = GraphQLRequest<String>(document: mutation);

    // In a real app, you'd handle the response. For now, we just send.
    await Amplify.API.mutate(request: request).response;
    safePrint(
      'Published location for $driverId: ${position.latitude}, ${position.longitude}',
    );
  }
}
