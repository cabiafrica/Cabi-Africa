import 'package:dio/dio.dart';
import 'package:driver_app/services/sos_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class MockDio extends Mock implements Dio {}

void main() {
  group('SosService', () {
    late SosService sosService;
    late MockDio mockDio;

    setUp(() {
      mockDio = MockDio();
      sosService = SosService(dio: mockDio);
    });

    test('activateSos completes normally on successful request (200)',
        () async {
      when(() => mockDio.post(any(), data: any(named: 'data'))).thenAnswer(
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
      when(() => mockDio.post(any(), data: any(named: 'data'))).thenAnswer(
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

    test('connectAudioStream returns a WebSocketChannel', () {
      final channel = sosService.connectAudioStream('test-trip');
      expect(channel, isA<WebSocketChannel>());
    });
  });
}
