import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

class PlaceSuggestion {
  final String placeId;
  final String description;
  final String mainText;
  final String secondaryText;
  final LatLng? location;
  final double? distanceKm;
  final String? category;

  PlaceSuggestion({
    required this.placeId,
    required this.description,
    required this.mainText,
    required this.secondaryText,
    this.location,
    this.distanceKm,
    this.category,
  });
}

class GooglePlacesService {
  static const String defaultApiKey = String.fromEnvironment(
    'GOOGLE_MAPS_API_KEY',
    defaultValue: '',
  );
  final String apiKey;

  GooglePlacesService({String? apiKey})
      : apiKey = apiKey ?? defaultApiKey;

  /// Search places with autocomplete with fallback to OpenStreetMap, biased by userLocation
  Future<List<PlaceSuggestion>> autocomplete(
    String query, {
    String countryCode = 'ke',
    LatLng? userLocation,
    double radiusMeters = 35000,
  }) async {
    if (query.trim().isEmpty) return [];
    if (apiKey.trim().isEmpty) {
      return _fallbackNominatim(query, countryCode, userLocation: userLocation);
    }

    try {
      final locationParam = userLocation != null
          ? '&location=${userLocation.latitude},${userLocation.longitude}&radius=${radiusMeters.toInt()}'
          : '';
      final uri = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json'
        '?input=${Uri.encodeComponent(query)}'
        '&components=country:$countryCode'
        '$locationParam'
        '&key=$apiKey',
      );

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 'OK' && data['predictions'] != null) {
          final List predictions = data['predictions'];
          return predictions.map((item) {
            final formatting = item['structured_formatting'] ?? {};
            return PlaceSuggestion(
              placeId: item['place_id'] ?? '',
              description: item['description'] ?? '',
              mainText: formatting['main_text'] ?? item['description'] ?? '',
              secondaryText: formatting['secondary_text'] ?? '',
            );
          }).toList();
        }
      }
    } catch (_) {
      // Graceful fallback to Nominatim on error
    }

    return _fallbackNominatim(query, countryCode, userLocation: userLocation);
  }

  /// Get place details (coordinates) for a given Google Place ID
  Future<LatLng?> getPlaceDetails(String placeId) async {
    if (placeId.isEmpty || apiKey.trim().isEmpty) return null;

    try {
      final uri = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/details/json'
        '?place_id=$placeId'
        '&fields=geometry'
        '&key=$apiKey',
      );

      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 'OK' && data['result']?['geometry']?['location'] != null) {
          final loc = data['result']['geometry']['location'];
          return LatLng(
            (loc['lat'] as num).toDouble(),
            (loc['lng'] as num).toDouble(),
          );
        }
      }
    } catch (_) {
      // Fallback or error handled by caller
    }
    return null;
  }

  /// Reverse geocode coordinates to an address string
  Future<String?> reverseGeocode(LatLng location) async {
    if (apiKey.trim().isNotEmpty) {
      try {
        final uri = Uri.parse(
          'https://maps.googleapis.com/maps/api/geocode/json'
          '?latlng=${location.latitude},${location.longitude}'
          '&key=$apiKey',
        );

        final response = await http.get(uri);
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          if (data['status'] == 'OK' && (data['results'] as List).isNotEmpty) {
            return data['results'][0]['formatted_address'] as String?;
          }
        }
      } catch (_) {
        // Ignore and fallback
      }
    }

    try {
      final nominatimUri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse'
        '?format=json'
        '&lat=${location.latitude}&lon=${location.longitude}',
      );
      final res = await http.get(nominatimUri, headers: {'User-Agent': 'CabiAfrica/1.0'});
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        return data['display_name'] as String?;
      }
    } catch (_) {}

    return null;
  }

  /// Nominatim fallback when Google Places API is unavailable
  Future<List<PlaceSuggestion>> _fallbackNominatim(
    String query,
    String countryCode, {
    LatLng? userLocation,
  }) async {
    try {
      String boundsParam = '';
      if (userLocation != null) {
        final left = userLocation.longitude - 0.4;
        final top = userLocation.latitude + 0.4;
        final right = userLocation.longitude + 0.4;
        final bottom = userLocation.latitude - 0.4;
        boundsParam = '&viewbox=$left,$top,$right,$bottom';
      }

      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/search'
        '?q=${Uri.encodeComponent(query)}'
        '&format=json'
        '&limit=8'
        '&countrycodes=$countryCode'
        '$boundsParam'
        '&addressdetails=1',
      );

      final response = await http.get(uri, headers: {
        'User-Agent': 'CabiAfrica/1.0',
        'Accept': 'application/json',
      });

      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        const distanceCalc = Distance();
        return data.map((item) {
          final lat = double.tryParse(item['lat']?.toString() ?? '');
          final lon = double.tryParse(item['lon']?.toString() ?? '');
          LatLng? loc;
          double? dist;
          if (lat != null && lon != null) {
            loc = LatLng(lat, lon);
            if (userLocation != null) {
              dist = distanceCalc.as(LengthUnit.Kilometer, userLocation, loc);
            }
          }
          return PlaceSuggestion(
            placeId: item['place_id']?.toString() ?? '',
            description: item['display_name'] ?? '',
            mainText: item['display_name']?.toString().split(',').first ?? '',
            secondaryText: item['display_name']?.toString().split(',').skip(1).join(',').trim() ?? '',
            location: loc,
            distanceKm: dist,
          );
        }).toList();
      }
    } catch (_) {}

    return [];
  }
}

