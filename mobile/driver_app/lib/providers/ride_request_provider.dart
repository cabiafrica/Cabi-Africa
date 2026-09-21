import 'dart:async';
import 'package:flutter/material.dart';

class RideRequestProvider with ChangeNotifier {
  Map<String, dynamic>? _currentRideRequest;
  Timer? _requestTimer;
  int _countdown = 20;
  VoidCallback? _onTimeout;

  Map<String, dynamic>? get currentRideRequest => _currentRideRequest;
  int get countdown => _countdown;

  void setRideRequest(Map<String, dynamic> requestData, {VoidCallback? onTimeout}) {
    _currentRideRequest = requestData;
    _onTimeout = onTimeout;
    _startTimer();
    notifyListeners();
  }

  void clearRideRequest() {
    _currentRideRequest = null;
    _onTimeout = null;
    _requestTimer?.cancel();
    notifyListeners();
  }

  void _startTimer() {
    _countdown = 20;
    _requestTimer?.cancel();
    _requestTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        _countdown--;
        notifyListeners();
      } else {
        // Auto pass and clear when 20 seconds expire
        final timeoutCb = _onTimeout;
        clearRideRequest();
        timeoutCb?.call();
      }
    });
  }
}