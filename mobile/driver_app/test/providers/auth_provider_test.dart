import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/services/auth_service.dart';

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

class MockAuthService extends Mock implements AuthService {}

class MockListener<T> extends Mock {
  void call(T? previous, T next);
}

// Fallback values for mocktail
class FakeIOSOptions extends Fake implements IOSOptions {}

class FakeAndroidOptions extends Fake implements AndroidOptions {}

void main() {
  late MockFlutterSecureStorage mockStorage;
  late MockAuthService mockAuthService;

  setUpAll(() {
    registerFallbackValue(FakeIOSOptions());
    registerFallbackValue(FakeAndroidOptions());
  });

  setUp(() {
    mockStorage = MockFlutterSecureStorage();
    mockAuthService = MockAuthService();

    // Stub methods with ANY parameters to avoid mismatch
    when(() => mockStorage.read(
          key: any(named: 'key'),
          iOptions: any(named: 'iOptions'),
          aOptions: any(named: 'aOptions'),
          lOptions: any(named: 'lOptions'),
          wOptions: any(named: 'wOptions'),
          mOptions: any(named: 'mOptions'),
        )).thenAnswer((_) async => null);

    when(() => mockStorage.write(
          key: any(named: 'key'),
          value: any(named: 'value'),
          iOptions: any(named: 'iOptions'),
          aOptions: any(named: 'aOptions'),
          lOptions: any(named: 'lOptions'),
          wOptions: any(named: 'wOptions'),
          mOptions: any(named: 'mOptions'),
        )).thenAnswer((_) async {});

    when(() => mockStorage.delete(
          key: any(named: 'key'),
          iOptions: any(named: 'iOptions'),
          aOptions: any(named: 'aOptions'),
          lOptions: any(named: 'lOptions'),
          wOptions: any(named: 'wOptions'),
          mOptions: any(named: 'mOptions'),
        )).thenAnswer((_) async {});
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
        final container = createContainer();
        await container.read(authProvider.notifier).tryAutoLogin();
        expect(container.read(authProvider), isA<Unauthenticated>());
        container.dispose();
      },
    );

    test('login success updates state and stores token', () async {
      final mockAuthResult = AuthResult(
        isSignedIn: true,
        token: 'test-token',
        user: {'id': 'driver-123', 'fullName': 'Test Driver', 'role': 'DRIVER'},
      );

      when(() => mockAuthService.signIn(any(), any()))
          .thenAnswer((_) async => mockAuthResult);

      final container = createContainer();

      await container
          .read(authProvider.notifier)
          .login('test@cabi.com', 'password');

      final state = container.read(authProvider);
      expect(state, isA<Authenticated>());
      final authState = state as Authenticated;
      expect(authState.token, 'test-token');
      expect(authState.userId, 'driver-123');

      verify(() => mockStorage.write(
            key: 'jwt_token',
            value: 'test-token',
            iOptions: any(named: 'iOptions'),
            aOptions: any(named: 'aOptions'),
            lOptions: any(named: 'lOptions'),
            wOptions: any(named: 'wOptions'),
            mOptions: any(named: 'mOptions'),
          )).called(1);

      container.dispose();
    });

    test('login failure does not update state', () async {
      when(() => mockAuthService.signIn(any(), any()))
          .thenThrow(Exception('Invalid credentials'));

      final container = createContainer();

      expect(
        () => container
            .read(authProvider.notifier)
            .login('test@cabi.com', 'wrong-password'),
        throwsException,
      );

      expect(container.read(authProvider), isA<Unauthenticated>());
      container.dispose();
    });

    test('logout clears state and deletes token', () async {
      final container = createContainer();
      await container.read(authProvider.notifier).logout();
      expect(container.read(authProvider), isA<Unauthenticated>());
      verify(() => mockStorage.delete(
            key: 'jwt_token',
            iOptions: any(named: 'iOptions'),
            aOptions: any(named: 'aOptions'),
            lOptions: any(named: 'lOptions'),
            wOptions: any(named: 'wOptions'),
            mOptions: any(named: 'mOptions'),
          )).called(1);
      container.dispose();
    });

    test('tryAutoLogin succeeds if token exists in storage', () async {
      when(() => mockStorage.read(
            key: 'jwt_token',
            iOptions: any(named: 'iOptions'),
            aOptions: any(named: 'aOptions'),
            lOptions: any(named: 'lOptions'),
            wOptions: any(named: 'wOptions'),
            mOptions: any(named: 'mOptions'),
          )).thenAnswer((_) async => 'stored-token');
      when(() => mockAuthService.getMe('stored-token')).thenAnswer(
        (_) async => AuthResult(
          isSignedIn: true,
          token: 'stored-token',
          user: {'id': 'driver-123'},
        ),
      );

      final container = createContainer();
      await container.read(authProvider.notifier).tryAutoLogin();

      final state = container.read(authProvider);
      expect(state, isA<Authenticated>());
      expect((state as Authenticated).token, 'stored-token');
      container.dispose();
    });
  });
}
