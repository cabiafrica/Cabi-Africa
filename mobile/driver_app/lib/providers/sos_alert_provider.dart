import 'package:flutter/material.dart';

class SOSAlertProvider with ChangeNotifier {
  Map<String, dynamic>? _alertData;

  Map<String, dynamic>? get alertData => _alertData;
  bool get isAlertActive => _alertData != null;

  void setAlert(Map<String, dynamic> data) {
    _alertData = data;
    notifyListeners();
  }

  void clearAlert() {
    _alertData = null;
    notifyListeners();
  }
}