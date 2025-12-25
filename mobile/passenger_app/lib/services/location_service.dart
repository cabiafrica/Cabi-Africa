import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<Position> getCurrentLocation() async {
    return await Geolocator.getCurrentPosition();
  }

  Stream<Position> get onLocationChanged => Geolocator.getPositionStream();

  Future<LocationPermission> requestPermission() async {
    return await Geolocator.requestPermission();
  }

  Future<bool> serviceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  Future<Map<String, double>> getLocationData() async {
    try {
      final position = await Geolocator.getCurrentPosition();
      return {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'heading': position.heading,
        'speed': position.speed,
      };
    } catch (e) {
      return {};
    }
  }
}
