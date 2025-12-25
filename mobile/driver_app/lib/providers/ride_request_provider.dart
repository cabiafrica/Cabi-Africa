import 'dart:async';
import 'package:flutter/material.dart';

class RideRequestProvider with ChangeNotifier {
  Map<String, dynamic>? _currentRideRequest;
  Timer? _requestTimer;
  int _countdown = 30;

  Map<String, dynamic>? get currentRideRequest => _currentRideRequest;
  int get countdown => _countdown;

  void setRideRequest(Map<String, dynamic> requestData) {
    _currentRideRequest = requestData;
    _startTimer();
    notifyListeners();
  }

  void clearRideRequest() {
    _currentRideRequest = null;
    _requestTimer?.cancel();
    notifyListeners();
  }

  void _startTimer() {
    _countdown = 30;
    _requestTimer?.cancel();
    _requestTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        _countdown--;
        notifyListeners();
      } else {
        // Implicitly reject if timer runs out
        clearRideRequest();
      }
    });
  }
}