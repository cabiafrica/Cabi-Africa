import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/services/user_service.dart';
import 'package:driver_app/config/app_config.dart';

class MockHttpClient extends Mock implements http.Client {}

void main() {
  late UserService userService;
  late MockHttpClient mockClient;

  setUp(() {
    mockClient = MockHttpClient();
    userService = UserService(client: mockClient);
    registerFallbackValue(Uri.parse('http://localhost'));
  });

  group('UserService', () {
    test('getUserProfile returns mock data', () async {
      final profile = await userService.getUserProfile();
      expect(profile['userId'], 'driver-123');
      expect(profile['fullName'], 'Test Driver');
      expect(profile['requiresBiometricCheck'], true);
    });

    test('postBiometricSuccess sends POST request and completes on 200',
        () async {
      when(() => mockClient.post(any(), headers: any(named: 'headers')))
          .thenAnswer((_) async => http.Response('', 200));

      await expectLater(userService.postBiometricSuccess(), completes);

      verify(() => mockClient.post(
            Uri.parse('${AppConfig.authApiUrl}/users/verify-biometric'),
            headers: any(named: 'headers'),
          )).called(1);
    });

    test('postBiometricSuccess throws HttpException on non-200', () async {
      when(() => mockClient.post(any(), headers: any(named: 'headers')))
          .thenAnswer((_) async => http.Response('Error', 400));

      expect(() => userService.postBiometricSuccess(),
          throwsA(isA<HttpException>()));
    });

    test('postBiometricFailure sends POST request and completes on 200',
        () async {
      when(() => mockClient.post(any(), headers: any(named: 'headers')))
          .thenAnswer((_) async => http.Response('', 200));

      await expectLater(userService.postBiometricFailure(), completes);

      verify(() => mockClient.post(
            Uri.parse('${AppConfig.authApiUrl}/users/biometric-failed'),
            headers: any(named: 'headers'),
          )).called(1);
    });

    test('postBiometricFailure throws HttpException on non-200', () async {
      when(() => mockClient.post(any(), headers: any(named: 'headers')))
          .thenAnswer((_) async => http.Response('Error', 500));

      expect(() => userService.postBiometricFailure(),
          throwsA(isA<HttpException>()));
    });
  });
}
