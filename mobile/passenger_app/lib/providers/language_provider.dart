import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:core_ui/core_ui.dart';

class LanguageProvider with ChangeNotifier {
  Locale _locale;

  LanguageProvider({Locale initialLocale = const Locale('en')})
      : _locale = initialLocale;

  Locale get locale => _locale;
  String get languageCode => _locale.languageCode;

  AppLanguage get currentLanguage =>
      CabiLocalizations.getLanguage(_locale.languageCode);

  static const String _languageKey = 'cabi_preferred_language';

  Future<void> setLanguage(String code) async {
    if (_locale.languageCode == code) return;
    _locale = Locale(code);
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_languageKey, code);
    } catch (e) {
      debugPrint('[LANGUAGE] Error saving preference: $e');
    }
  }
}
