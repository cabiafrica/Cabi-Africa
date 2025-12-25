import 'package:firebase_analytics/firebase_analytics.dart';

/// A wrapper around an analytics provider (e.g., Firebase Analytics)
/// to abstract away the specific implementation from the rest of the app.
class AnalyticsService {
  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;

  /// Logs a custom event.
  ///
  /// Use this for tracking key user actions like 'ride_requested' or 'payment_success'.
  Future<void> logEvent(String name, {Map<String, Object>? parameters}) async {
    await _analytics.logEvent(name: name, parameters: parameters);
  }

  /// Sets a user property to a given value.
  ///
  /// Use this to set properties that describe your users, like 'account_type'.
  Future<void> setUserProperty(String name, String? value) async {
    await _analytics.setUserProperty(name: name, value: value);
  }

  /// Sets the user ID for all subsequent events.
  Future<void> setUserId(String? id) async {
    await _analytics.setUserId(id: id);
  }

  /// Logs a screen view event.
  ///
  /// This can be used with a RouteObserver to automatically track screen transitions.
  Future<void> logScreenView(String screenName) async {
    await _analytics.logScreenView(screenName: screenName);
  }
}
