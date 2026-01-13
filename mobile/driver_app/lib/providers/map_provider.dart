import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum MapType { cabi, google }

class MapNotifier extends StateNotifier<MapType> {
  MapNotifier() : super(MapType.cabi) {
    _loadMapPreference();
  }

  static const String _mapKey = 'map_provider_preference';

  Future<void> _loadMapPreference() async {
    final prefs = await SharedPreferences.getInstance();
    final mapString = prefs.getString(_mapKey);
    if (mapString == 'google') {
      state = MapType.google;
    } else {
      state = MapType.cabi; // Default to Cabi
    }
  }

  Future<void> setMapType(MapType type) async {
    state = type;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_mapKey, type == MapType.cabi ? 'cabi' : 'google');
  }
}

final mapProvider = StateNotifierProvider<MapNotifier, MapType>((ref) {
  return MapNotifier();
});
