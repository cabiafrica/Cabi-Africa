import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/services/ratings_service.dart';

void main() {
  group('RatingsService', () {
    late RatingsService service;

    setUp(() {
      service = RatingsService();
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
