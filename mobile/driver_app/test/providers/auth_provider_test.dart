import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:driver_app/providers/auth_provider.dart';

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

class MockAuthService extends Mock implements AuthService {}

class MockListener<T> extends Mock {
  void call(T? previous, T next);
}

void main() {
  late MockFlutterSecureStorage mockStorage;
  late MockAuthService mockAuthService;

  setUp(() {
    mockStorage = MockFlutterSecureStorage();
    mockAuthService = MockAuthService();
  });

  group('AuthProvider Tests', () {
    ProviderContainer createContainer() {
      return ProviderContainer(
        overrides: [
          secureStorageProvider.overrideWithValue(mockStorage),
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
    }

    test(
      'initial state is AuthInitial, then Unauthenticated after auto-login check',
      () async {
        // Arrange
        when(() => mockStorage.read(key: 'authToken'))
            .thenAnswer((_) async => null);
        final container = createContainer();
        final listener = MockListener<AuthState>();
        container.listen(authProvider, listener, fireImmediately: true);

        // Assert
        verify(() => listener(null, any(that: isA<AuthInitial>()))).called(1);

        // Let auto-login complete
        await container.read(authProvider.notifier).tryAutoLogin();

        verify(
          () => listener(
              any(that: isA<AuthInitial>()), any(that: isA<Unauthenticated>())),
        ).called(1);

        container.dispose();
      },
    );

    test('login success updates state and stores token', () async {
      // Arrange
      when(
        () => mockAuthService.verifyOtp(
          phone: any(named: 'phone'),
          otp: any(named: 'otp'),
        ),
      ).thenAnswer((_) async => {'token': 'test-token'});
      when(
        () => mockStorage.write(key: 'authToken', value: 'test-token'),
      ).thenAnswer((_) async {});
      final container = createContainer();

      // Act
      await container
          .read(authProvider.notifier)
          .login('1234567890', 'password');

      // Assert
      final state = container.read(authProvider);
      expect(state, isA<Authenticated>());
      expect((state as Authenticated).token, 'test-token');
      verify(
        () => mockStorage.write(key: 'authToken', value: 'test-token'),
      ).called(1);
      container.dispose();
    });

    test('login failure does not update state', () async {
      // Arrange
      when(
        () => mockAuthService.verifyOtp(
          phone: any(named: 'phone'),
          otp: any(named: 'otp'),
        ),
      ).thenThrow(Exception('Invalid OTP'));
      final container = createContainer();

      // Act & Assert
      expect(
        () => container
            .read(authProvider.notifier)
            .login('1234567890', 'wrong-password'),
        throwsException,
      );

      // After failure, state should revert to Unauthenticated
      expect(container.read(authProvider), isA<Unauthenticated>());
      verifyNever(() => mockStorage.write(
          key: any(named: 'key'), value: any(named: 'value')));
      container.dispose();
    });

    test('logout clears state and deletes token', () async {
      // Arrange: Simulate a logged-in state first
      final container = createContainer();
      // Manually set state for test setup
      container.read(authProvider.notifier).state = const Authenticated(
        'test-token',
      );
      when(() => mockStorage.delete(key: 'authToken')).thenAnswer((_) async {});

      // Act
      await container.read(authProvider.notifier).logout();

      // Assert
      expect(container.read(authProvider), isA<Unauthenticated>());
      verify(() => mockStorage.delete(key: 'authToken')).called(1);
      container.dispose();
    });

    test('tryAutoLogin succeeds if token exists in storage', () async {
      // Arrange
      when(
        () => mockStorage.read(key: 'authToken'),
      ).thenAnswer((_) async => 'stored-token');
      final container = createContainer();

      // Act
      await container.read(authProvider.notifier).tryAutoLogin();

      // Assert
      final state = container.read(authProvider);
      expect(state, isA<Authenticated>());
      expect((state as Authenticated).token, 'stored-token');
      container.dispose();
    });
  });
}
