import 'package:dio/dio.dart';
import 'package:driver_app/services/sos_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MockDio extends Mock implements Dio {}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  SharedPreferences.setMockInitialValues({});

  group('SosService', () {
    late SosService sosService;
    late MockDio mockDio;

    setUp(() {
      mockDio = MockDio();
      sosService = SosService(dio: mockDio);
    });

    test('activateSos completes normally on successful request (200)',
        () async {
      when(() => mockDio.post(any(), data: any(named: 'data'), options: any(named: 'options'))).thenAnswer(
        (_) async => Response(
          data: {'status': 'SOS_ACTIVATED'},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        ),
      );

      await expectLater(
        sosService.activateSos('test-trip', {'lat': 0.0, 'lng': 0.0}),
        completes,
      );
    });

    test('activateSos throws Exception on failed request (500)', () async {
      when(() => mockDio.post(any(), data: any(named: 'data'), options: any(named: 'options'))).thenAnswer(
        (_) async => Response(
          data: {'message': 'Server error'},
          statusCode: 500,
          requestOptions: RequestOptions(path: ''),
        ),
      );

      expect(
        () => sosService.activateSos('test-trip', {'lat': 0.0, 'lng': 0.0}),
        throwsA(isA<Exception>()),
      );
    });
  });
}
