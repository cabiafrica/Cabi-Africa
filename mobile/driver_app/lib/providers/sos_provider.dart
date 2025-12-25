import 'package:flutter/material.dart';

class SOSProvider with ChangeNotifier {
  bool _isSOSActive = false;

  bool get isSOSActive => _isSOSActive;

  void activateSOS() {
    _isSOSActive = true;
    notifyListeners();
  }

  void deactivateSOS() {
    _isSOSActive = false;
    notifyListeners();
  }
}