import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';

/// A wrapper around an analytics provider to abstract specifically implementation.
class AnalyticsService {
  FirebaseAnalytics? _analytics;
  bool _initialized = false;

  AnalyticsService() {
    _init();
  }

  Future<void> _init() async {
    try {
      _analytics = FirebaseAnalytics.instance;
      _initialized = true;
    } catch (e) {
      debugPrint("Analytics initialization failed: $e. Using mock.");
    }
  }

  /// Logs a custom event.
  Future<void> logEvent(String name, {Map<String, Object>? parameters}) async {
    if (!_initialized) return;
    await _analytics?.logEvent(name: name, parameters: parameters);
  }

  /// Sets a user property.
  Future<void> setUserProperty(String name, String? value) async {
    if (!_initialized) return;
    await _analytics?.setUserProperty(name: name, value: value);
  }

  /// Sets the user ID.
  Future<void> setUserId(String? id) async {
    if (!_initialized) return;
    await _analytics?.setUserId(id: id);
  }

  /// Logs a screen view.
  Future<void> logScreenView(String screenName) async {
    if (!_initialized) return;
    await _analytics?.logScreenView(screenName: screenName);
  }
}
