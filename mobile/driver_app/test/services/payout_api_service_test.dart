import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/services/payout_api_service.dart';
import 'package:driver_app/models/payout_dto.dart';

class MockDio extends Mock implements Dio {}

class MockResponse extends Mock implements Response<dynamic> {}

void main() {
  late PayoutApiService payoutApiService;
  late MockDio mockDio;

  setUp(() {
    mockDio = MockDio();
    payoutApiService = PayoutApiService(mockDio);
  });

  group('PayoutApiService', () {
    test('getAvailableEarnings returns balance from backend', () async {
      final mockResponse = MockResponse();
      when(() => mockResponse.data).thenReturn({'balance': 250.00});
      when(() => mockDio.get(
            '/earnings/balance',
            queryParameters: {'driverId': 'driver-123'},
          )).thenAnswer((_) async => mockResponse);

      final earnings =
          await payoutApiService.getAvailableEarnings('driver-123');
      expect(earnings, 250.00);
    });

    test('requestPayout calls post with correct data and returns PayoutDto',
        () async {
      // Arrange
      final requestDto =
          RequestPayoutDto(amount: 100.0, paymentMethod: 'M-Pesa');
      final mockData = {
        'id': 'payout-123',
        'amount': 100.0,
        'status': 'PENDING',
        'date': '2024-08-22T10:00:00Z',
      };

      final mockResponse = MockResponse();
      when(() => mockResponse.data).thenReturn(mockData);

      when(() => mockDio.post(
            any(),
            data: any(named: 'data'),
          )).thenAnswer((_) async => mockResponse);

      // Act
      final result = await payoutApiService.requestPayout(requestDto);

      // Assert
      expect(result.id, 'payout-123');
      expect(result.amount, 100.0);
      expect(result.status, 'PENDING');

      verify(() => mockDio.post(
            '/payouts/request',
            data: requestDto.toJson(),
          )).called(1);
    });
  });
}
