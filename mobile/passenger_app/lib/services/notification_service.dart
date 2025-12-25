import 'dart:async';

/// A service to simulate and handle incoming push notifications for ride requests.
class NotificationService {
  // Using a singleton pattern to ensure a single instance across the app.
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  // A broadcast stream controller allows multiple listeners.
  final _rideRequestController =
      StreamController<Map<String, dynamic>>.broadcast();

  /// The stream that UI components can listen to for new ride requests.
  Stream<Map<String, dynamic>> get rideRequestStream =>
      _rideRequestController.stream;

  /// In a real app, this would be called by the push notification handler.
  void handleRideRequest(Map<String, dynamic> rideDetails) =>
      _rideRequestController.add(rideDetails);

  void dispose() => _rideRequestController.close();
}
