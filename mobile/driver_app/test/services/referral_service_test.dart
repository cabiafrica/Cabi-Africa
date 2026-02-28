import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';

import 'package:driver_app/services/referral_service.dart';

class MockHttpClient extends Mock implements http.Client {}

http.Response jsonOk(Object body) => http.Response(jsonEncode(body), 200);
http.Response err500() => http.Response('Error', 500);

void main() {
  late ReferralService referralService;
  late MockHttpClient mockClient;

  setUpAll(() {
    registerFallbackValue(Uri.parse('http://example.com'));
  });

  setUp(() {
    mockClient = MockHttpClient();
    referralService = ReferralService(client: mockClient);
  });

  group('ReferralService', () {
    const driverId = 'driver-abc';

    // ── getReferralStats ───────────────────────────────────────────────────
    test('getReferralStats returns parsed map on 200', () async {
      when(() => mockClient.get(any())).thenAnswer((_) async => jsonOk({
            'totalEarned': 1500.0,
            'pendingAmount': 200.0,
            'referralCount': 3,
          }));

      final result = await referralService.getReferralStats(driverId);
      expect(result['totalEarned'], 1500.0);
      expect(result['referralCount'], 3);
    });

    test('getReferralStats returns error map on 500', () async {
      when(() => mockClient.get(any())).thenAnswer((_) async => err500());

      final result = await referralService.getReferralStats(driverId);
      expect(result.containsKey('error'), isTrue);
    });

    test('getReferralStats returns error map on network exception', () async {
      when(() => mockClient.get(any())).thenThrow(Exception('No connection'));

      final result = await referralService.getReferralStats(driverId);
      expect(result.containsKey('error'), isTrue);
    });

    // ── getReferralCode ────────────────────────────────────────────────────
    test('getReferralCode returns code from response', () async {
      when(() => mockClient.get(any()))
          .thenAnswer((_) async => jsonOk({'code': 'CABI-XYZ123'}));

      final code = await referralService.getReferralCode(driverId);
      expect(code, 'CABI-XYZ123');
    });

    test('getReferralCode returns fallback string on non-200', () async {
      when(() => mockClient.get(any())).thenAnswer((_) async => err500());

      final code = await referralService.getReferralCode(driverId);
      expect(code, isNotEmpty);
    });

    test('getReferralCode returns fallback on network error', () async {
      when(() => mockClient.get(any())).thenThrow(Exception('Timeout'));

      final code = await referralService.getReferralCode(driverId);
      expect(code, isNotEmpty);
    });

    // ── getDownline ────────────────────────────────────────────────────────
    test('getDownline returns list of referrals on success', () async {
      when(() => mockClient.get(any())).thenAnswer((_) async => jsonOk([
            {'userId': 'u1', 'name': 'Ali'},
            {'userId': 'u2', 'name': 'Beth'},
          ]));

      final downline = await referralService.getDownline(driverId);
      expect(downline.length, 2);
      expect(downline.first['name'], 'Ali');
    });

    test('getDownline returns empty list on error', () async {
      when(() => mockClient.get(any())).thenThrow(Exception('Network error'));

      final downline = await referralService.getDownline(driverId);
      expect(downline, isEmpty);
    });
  });
}
