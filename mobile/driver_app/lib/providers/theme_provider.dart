import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Implementation of Theme Notifier
class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier(super.initialMode);

  static const String themeKey = 'theme_mode';

  Future<void> setTheme(ThemeMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    if (mode == ThemeMode.light) {
      await prefs.setString(themeKey, 'light');
    } else if (mode == ThemeMode.dark) {
      await prefs.setString(themeKey, 'dark');
    } else {
      await prefs.remove(themeKey);
    }
  }

  void toggleTheme() {
    if (state == ThemeMode.dark) {
      setTheme(ThemeMode.light);
    } else {
      setTheme(ThemeMode.dark); // Default to dark if system or light
    }
  }
}

// Global provider is now created with an override in ProviderScope or initialized later.
// We will change it to require an override or a default initial value.
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  // Fallback if not overridden
  return ThemeNotifier(ThemeMode.system);
});
