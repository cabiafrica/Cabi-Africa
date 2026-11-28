import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';

import 'package:driver_app/services/ride_service.dart';

// ─── Mock HTTP client ──────────────────────────────────────────────────────
class MockHttpClient extends Mock implements http.Client {}

// ─── Helpers ─────────────────────────────────────────────────────────────
http.Response jsonOk(Object body, {int statusCode = 200}) =>
    http.Response(jsonEncode(body), statusCode);

http.Response emptyOk({int statusCode = 200}) =>
    http.Response('{}', statusCode);

void main() {
  late MockHttpClient mockClient;
  late RideService rideService;

  setUpAll(() {
    registerFallbackValue(Uri.parse('http://example.com'));
    registerFallbackValue(<String, String>{});
  });

  setUp(() {
    mockClient = MockHttpClient();
    rideService = RideService(client: mockClient);
  });

  group('RideService', () {
    const rideId = 'test-ride-123';
    const driverId = 'driver-123';

    // ── getDriverStatus ────────────────────────────────────────────────────
    test('getDriverStatus returns true when backend says isOnline', () async {
      when(() => mockClient.get(any(), headers: any(named: 'headers')))
          .thenAnswer((_) async => jsonOk({'isOnline': true}));

      final result = await rideService.getDriverStatus(driverId);
      expect(result, isTrue);
    });

    test('getDriverStatus returns false on non-200 response', () async {
      when(() => mockClient.get(any(), headers: any(named: 'headers')))
          .thenAnswer((_) async => http.Response('Server Error', 500));

      final result = await rideService.getDriverStatus(driverId);
      expect(result, isFalse);
    });

    test('getDriverStatus returns false on network error', () async {
      when(() => mockClient.get(any(), headers: any(named: 'headers')))
          .thenThrow(Exception('Network error'));

      final result = await rideService.getDriverStatus(driverId);
      expect(result, isFalse);
    });

    // ── toggleOnlineStatus ─────────────────────────────────────────────────
    test('toggleOnlineStatus completes without throwing', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenAnswer((_) async => emptyOk());

      expect(rideService.toggleOnlineStatus(driverId, true), completes);
    });

    // ── acceptRide ─────────────────────────────────────────────────────────
    test('acceptRide completes successfully on a 200 response', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenAnswer((_) async => emptyOk());

      expect(rideService.acceptRide(rideId, driverId), completes);
    });

    test('acceptRide completes successfully on a 201 response', () async {
      when(() => mockClient.post(any(),
              headers: any(named: 'headers'), body: any(named: 'body')))
          .thenAnswer((_) async => emptyOk(statusCode: 201));

      expect(rideService.acceptRide(rideId, driverId), completes);
    });

    // ── rejectRide ─────────────────────────────────────────────────────────
    test('rejectRide completes successfully', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenAnswer((_) async => emptyOk());

      expect(rideService.rejectRide(rideId, driverId), completes);
    });

    test('rejectRide sends reason when provided', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenAnswer((_) async => emptyOk());

      await rideService.rejectRide(rideId, driverId, 'Too far away');

      final captured = verify(() => mockClient.post(
            any(),
            headers: any(named: 'headers'),
            body: captureAny(named: 'body'),
          )).captured;

      expect(captured.last, contains('Too far away'));
    });

    // ── startTrip ─────────────────────────────────────────────────────────
    test('startTrip completes successfully', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenAnswer((_) async => emptyOk());

      expect(rideService.startTrip(rideId), completes);
    });

    // ── completeTrip ───────────────────────────────────────────────────────
    test('completeTrip returns 450.0 on success', () async {
      when(() => mockClient.post(any(),
              headers: any(named: 'headers'), body: any(named: 'body')))
          .thenAnswer((_) async => jsonOk({'fare': 450.0}));

      final fare = await rideService.completeTrip(rideId);
      expect(fare, 450.0);
    });

    test('completeTrip returns 0.0 fallback on network error', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenThrow(Exception('Network error'));

      final fare = await rideService.completeTrip(rideId);
      expect(fare, 0.0);
    });

    // ── confirmCashPayment ─────────────────────────────────────────────────
    test('confirmCashPayment completes without throwing', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenAnswer((_) async => emptyOk());

      expect(rideService.confirmCashPayment(rideId, 450.0), completes);
    });

    // ── submitRating ───────────────────────────────────────────────────────
    test('submitRating sends rating and comment', () async {
      when(() => mockClient.post(any(),
          headers: any(named: 'headers'),
          body: any(named: 'body'))).thenAnswer((_) async => emptyOk());

      await rideService.submitRating(
          tripId: rideId, rating: 5.0, comment: 'Great ride!');

      final captured = verify(() => mockClient.post(
            any(),
            headers: any(named: 'headers'),
            body: captureAny(named: 'body'),
          )).captured;

      expect(captured.last, contains('Great ride!'));
    });
  });
}
