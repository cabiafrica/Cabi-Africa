import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:passenger_app/config/app_config.dart';

/// Service for fetching and updating system-level settings from the backend.
class SettingsService {
  /// Fetches the value of a system setting by key.
  /// Returns the value as a plain Dart object, or null if not found / on error.
  Future<dynamic> getSystemSetting(String key) async {
    try {
      final uri = Uri.parse('${AppConfig.dispatchApiUrl}/settings/system/$key');
      final response = await http.get(uri).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // The backend returns { key: '...', value: ... }
        return data['value'];
      } else {
        debugPrint(
            '[SettingsService] Failed to fetch "$key": ${response.statusCode}');
        return null;
      }
    } catch (e) {
      debugPrint('[SettingsService] Error fetching "$key": $e');
      return null;
    }
  }

  /// Convenience helper to fetch `tours_url` as a String.
  /// Returns an empty string if the setting is absent or not a string.
  Future<String> getToursUrl() async {
    final value = await getSystemSetting('tours_url');
    if (value is String) return value;
    return '';
  }
}
