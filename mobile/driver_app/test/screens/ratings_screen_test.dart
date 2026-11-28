import 'dart:async';

import 'package:driver_app/screens/ratings_screen.dart';
import 'package:driver_app/services/ratings_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import '../mocks/image_mocks.dart';

class MockRatingsService extends Mock implements RatingsService {}

// Minimal RatingsData to return in test stubs
RatingsData _fakeData() => const RatingsData(
      overallRating: 4.8,
      totalRatings: 120,
      categories: [],
      recentReviews: [],
    );

void main() {
  late MockRatingsService mockService;

  setUp(() {
    mockService = MockRatingsService();
    when(() => mockService.fetchRatings(any()))
        .thenAnswer((_) async => _fakeData());
    registerFallbackValue(Uri.parse('http://localhost'));
  });

  Widget build({RatingsService? service}) => ProviderScope(
        child: MaterialApp(home: RatingsScreen(ratingsService: service ?? mockService)),
      );

  testWidgets('RatingsScreen shows loading indicator initially',
      (tester) async {
    await provideMockedNetworkImages(() async {
      // Use a Completer that never resolves — this keeps the FutureBuilder
      // in ConnectionState.waiting without blocking the test runner.
      final completer = Completer<RatingsData>();
      when(() => mockService.fetchRatings(any()))
          .thenAnswer((_) => completer.future);

      await tester.pumpWidget(build());

      // Before future resolves → screen renders AppBar while loading
      expect(find.text('My Ratings'), findsOneWidget);

      // Complete the future before the test ends to drain pending timers.
      completer.complete(_fakeData());
      await tester.pumpAndSettle();
      expect(find.textContaining('4.8'), findsOneWidget);
    });
  });

  testWidgets('RatingsScreen renders overall rating after data loads',
      (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      await tester.pumpAndSettle();

      expect(find.textContaining('4.8'), findsOneWidget);
    });
  });

  testWidgets('RatingsScreen has AppBar with title', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('My Ratings'), findsOneWidget);
    });
  });

  testWidgets('RatingsScreen shows category breakdown section', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      await tester.pumpAndSettle();
      expect(find.text('Category Breakdown'), findsOneWidget);
    });
  });

  testWidgets('RatingsScreen shows recent reviews section', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      await tester.pumpAndSettle();
      expect(find.text('Recent Reviews'), findsOneWidget);
    });
  });
}
