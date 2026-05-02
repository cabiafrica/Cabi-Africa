import 'dart:async';
import 'package:flutter/foundation.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  // final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  // Stream controller to broadcast SOS alerts to the app
  final _sosAlertController =
      StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get sosAlertStream => _sosAlertController.stream;

  final _rideRequestController =
      StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get rideRequestStream =>
      _rideRequestController.stream;

  void initialize() {
    // _firebaseMessaging.onMessage.listen((RemoteMessage message) {
    //   if (message.data['type'] == 'SOS_ALERT') {
    //     _sosAlertController.add(message.data);
    //   }
    // });
    debugPrint('Notification Service Initialized');
  }

  // Method to simulate receiving an SOS alert (for testing/demo)
  void simulateSosAlert() {
    _sosAlertController.add({
      'tripId': 'trip_123',
      'lat': -1.2921,
      'lng': 36.8219,
      'driverName': 'ELITE DRIVER',
      'distance': '2.5 km',
    });
  }

  void dispose() {
    _sosAlertController.close();
    _rideRequestController.close();
  }
}
