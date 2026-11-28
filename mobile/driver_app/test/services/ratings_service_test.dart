import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/services/ratings_service.dart';

class MockHttpClient extends Mock implements http.Client {}

void main() {
  setUpAll(() {
    registerFallbackValue(Uri.parse('http://example.com'));
  });

  group('RatingsService', () {
    late MockHttpClient mockClient;
    late RatingsService service;

    setUp(() {
      mockClient = MockHttpClient();
      when(() => mockClient.get(any())).thenAnswer(
        (_) async => http.Response(
          jsonEncode([
            {
              'id': 'rev-1',
              'raterName': 'Amina Wanjiku',
              'stars': 5,
              'comment': 'Smooth and safe ride!',
              'createdAt': '2026-11-20T10:00:00Z',
            },
            {
              'id': 'rev-2',
              'raterName': 'Peter Kamau',
              'stars': 4,
              'comment': 'Very polite driver.',
              'createdAt': '2026-11-21T14:30:00Z',
            },
          ]),
          200,
        ),
      );
      service = RatingsService(client: mockClient);
    });

    test('fetchRatings returns RatingsData with a positive overall rating',
        () async {
      final data = await service.fetchRatings('driver-001');

      expect(data.overallRating, greaterThan(0));
      expect(data.overallRating, lessThanOrEqualTo(5.0));
    });

    test('fetchRatings returns a non-zero totalRatings count', () async {
      final data = await service.fetchRatings('driver-001');

      expect(data.totalRatings, greaterThan(0));
    });

    test('fetchRatings returns 4 category ratings', () async {
      final data = await service.fetchRatings('driver-001');

      expect(data.categories.length, equals(4));
    });

    test('all category scores are between 1 and 5', () async {
      final data = await service.fetchRatings('driver-001');

      for (final cat in data.categories) {
        expect(cat.score, greaterThanOrEqualTo(1.0));
        expect(cat.score, lessThanOrEqualTo(5.0));
      }
    });

    test('fetchRatings returns at least one passenger review', () async {
      final data = await service.fetchRatings('driver-001');

      expect(data.recentReviews, isNotEmpty);
    });

    test('each review has a non-empty passengerName and a valid rating',
        () async {
      final data = await service.fetchRatings('driver-001');

      for (final review in data.recentReviews) {
        expect(review.passengerName, isNotEmpty);
        expect(review.rating, greaterThanOrEqualTo(1.0));
        expect(review.rating, lessThanOrEqualTo(5.0));
      }
    });

    test('each review has a non-empty id and date', () async {
      final data = await service.fetchRatings('driver-001');

      for (final review in data.recentReviews) {
        expect(review.id, isNotEmpty);
        expect(review.date, isNotEmpty);
      }
    });
  });
}
