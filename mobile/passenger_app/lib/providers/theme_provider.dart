import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider with ChangeNotifier {
  ThemeMode _themeMode;

  ThemeProvider({ThemeMode initialMode = ThemeMode.system}) : _themeMode = initialMode;

  ThemeMode get themeMode => _themeMode;

  static const String _themeKey = 'theme_mode';

  Future<void> setTheme(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    if (mode == ThemeMode.light) {
      await prefs.setString(_themeKey, 'light');
    } else if (mode == ThemeMode.dark) {
      await prefs.setString(_themeKey, 'dark');
    } else {
      await prefs.remove(_themeKey);
    }
  }

  void toggleTheme(bool isDark) {
    setTheme(isDark ? ThemeMode.dark : ThemeMode.light);
  }
}
