import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:core_ui/core_ui.dart';

class LanguageNotifier extends StateNotifier<Locale> {
  LanguageNotifier([super.initialLocale = const Locale('en')]);

  static const String languageKey = 'cabi_preferred_language';

  Future<void> setLanguage(String languageCode) async {
    state = Locale(languageCode);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(languageKey, languageCode);
    } catch (e) {
      debugPrint('[LANGUAGE] Error saving preference: $e');
    }
  }

  AppLanguage get currentLanguage =>
      CabiLocalizations.getLanguage(state.languageCode);
}

final languageProvider =
    StateNotifierProvider<LanguageNotifier, Locale>((ref) {
  return LanguageNotifier();
});
