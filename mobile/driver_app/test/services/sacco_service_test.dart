import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';

import 'package:driver_app/services/sacco_service.dart';

class MockHttpClient extends Mock implements http.Client {}

http.Response jsonOk(Object body) => http.Response(jsonEncode(body), 200);
http.Response err500() => http.Response('Error', 500);

void main() {
  late SaccoService saccoService;
  late MockHttpClient mockClient;

  setUpAll(() {
    registerFallbackValue(Uri.parse('http://example.com'));
  });

  setUp(() {
    mockClient = MockHttpClient();
    saccoService = SaccoService(client: mockClient);
  });

  group('SaccoService', () {
    const driverId = 'driver-abc';

    // ── getSaccoHealth ─────────────────────────────────────────────────────
    test('getSaccoHealth returns status on success', () async {
      when(() => mockClient.get(any()))
          .thenAnswer((_) async => jsonOk({'status': 'ok'}));

      final result = await saccoService.getSaccoHealth();
      expect(result['status'], 'ok');
    });

    test('getSaccoHealth returns error map on exception', () async {
      when(() => mockClient.get(any())).thenThrow(Exception('No host'));

      final result = await saccoService.getSaccoHealth();
      expect(result['status'], 'error');
    });

    // ── getSavingsBalance ──────────────────────────────────────────────────
    test('getSavingsBalance returns balance map on 200', () async {
      when(() => mockClient.get(any())).thenAnswer((_) async => jsonOk({
            'totalSavings': 5000.0,
            'availableWithdrawal': 2000.0,
          }));

      final balance = await saccoService.getSavingsBalance(driverId);
      expect(balance['totalSavings'], 5000.0);
      expect(balance['availableWithdrawal'], 2000.0);
    });

    test('getSavingsBalance returns zero fallback on non-200', () async {
      when(() => mockClient.get(any())).thenAnswer((_) async => err500());

      final balance = await saccoService.getSavingsBalance(driverId);
      expect(balance['totalSavings'], 0.0);
    });

    test('getSavingsBalance returns zero fallback on network error', () async {
      when(() => mockClient.get(any())).thenThrow(Exception('Timeout'));

      final balance = await saccoService.getSavingsBalance(driverId);
      expect(balance.containsKey('error'), isTrue);
      expect(balance['totalSavings'], 0.0);
    });

    // ── getTransactions ────────────────────────────────────────────────────
    test('getTransactions returns list of SaccoTransaction on 200', () async {
      when(() => mockClient.get(any())).thenAnswer((_) async => jsonOk([
            {
              'id': 'tx-1',
              'amount': '200',
              'type': 'DEPOSIT',
              'createdAt': '2025-01-01'
            },
            {
              'id': 'tx-2',
              'amount': '100',
              'type': 'WITHDRAWAL',
              'createdAt': '2025-01-10'
            },
          ]));

      final transactions = await saccoService.getTransactions(driverId);
      expect(transactions.length, 2);
      expect(transactions.first.type, 'DEPOSIT');
      expect(transactions.first.amount, 200.0);
    });

    test('getTransactions returns empty list on error', () async {
      when(() => mockClient.get(any())).thenThrow(Exception('Network error'));

      final transactions = await saccoService.getTransactions(driverId);
      expect(transactions, isEmpty);
    });
  });
}
