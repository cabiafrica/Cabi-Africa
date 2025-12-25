import 'package:flutter/material.dart';

class ActiveRideProvider with ChangeNotifier {
  Map<String, dynamic>? _activeRide;

  Map<String, dynamic>? get activeRide => _activeRide;
  bool get isRideActive => _activeRide != null;

  void startRide(Map<String, dynamic> rideData) {
    _activeRide = rideData;
    // In a real app, this would also subscribe to WebSocket updates for this ride.
    notifyListeners();
  }

  void endRide() {
    _activeRide = null;
    notifyListeners();
  }

  void updateRideStatus(String status) {
    if (_activeRide != null) {
      _activeRide!['status'] = status;
      notifyListeners();
    }
  }
}