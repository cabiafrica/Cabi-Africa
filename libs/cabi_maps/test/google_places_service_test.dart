import 'package:cabi_maps/src/google_places_service.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('GooglePlacesService security & config', () {
    test('does not embed a hardcoded Google API key by default', () {
      expect(GooglePlacesService.defaultApiKey, isEmpty);
      expect(GooglePlacesService.defaultApiKey.startsWith('AIza'), isFalse);
    });

    test('returns empty list for blank queries without making network calls', () async {
      final service = GooglePlacesService(apiKey: '');
      final results = await service.autocomplete('   ');
      expect(results, isEmpty);
    });

    test('returns null from getPlaceDetails when apiKey or placeId is empty', () async {
      final service = GooglePlacesService(apiKey: '');
      expect(await service.getPlaceDetails('ChIJ123'), isNull);

      final withKey = GooglePlacesService(apiKey: 'fake-key');
      expect(await withKey.getPlaceDetails(''), isNull);
    });
  });
}
