import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:passenger_app/services/auth_service.dart';
import 'package:passenger_app/screens/login_screen.dart';
import 'package:passenger_app/screens/home_screen.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:passenger_app/providers/auth_provider.dart';

import 'package:passenger_app/services/ride_service.dart';
import 'package:passenger_app/providers/providers.dart';

class MockAuthService extends Mock implements AuthService {}

class MockRideService extends Mock implements RideService {}

class MockHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return MockHttpClient();
  }
}

class MockHttpClient extends Mock implements HttpClient {
  @override
  Future<HttpClientRequest> getUrl(Uri url) => _mockRequest(url);
  @override
  Future<HttpClientRequest> get(String host, int port, String path) =>
      _mockRequest(Uri(host: host, port: port, path: path));

  Future<HttpClientRequest> _mockRequest(Uri url) async {
    final isApi = url.port == 3333 || url.port == 3000;
    return MockHttpClientRequest(isApi);
  }
}

class MockHttpClientRequest extends Mock implements HttpClientRequest {
  final bool isApi;
  MockHttpClientRequest(this.isApi);

  @override
  Future<HttpClientResponse> close() async {
    return MockHttpClientResponse(isApi);
  }
}

class MockHttpClientResponse extends Mock implements HttpClientResponse {
  final bool isApi;
  MockHttpClientResponse(this.isApi);

  @override
  int get statusCode => 200;
  @override
  int get contentLength => 0;
  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;
  @override
  StreamSubscription<List<int>> listen(void Function(List<int> event)? onData,
      {Function? onError, void Function()? onDone, bool? cancelOnError}) {
    final bytes = isApi
        ? [123, 125] // {}
        : [
            137,
            80,
            78,
            71,
            13,
            10,
            26,
            10,
            0,
            0,
            0,
            13,
            73,
            72,
            68,
            82,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            8,
            6,
            0,
            0,
            0,
            31,
            21,
            196,
            137,
            0,
            0,
            0,
            10,
            73,
            68,
            65,
            84,
            120,
            156,
            99,
            0,
            1,
            0,
            0,
            5,
            0,
            1,
            13,
            10,
            45,
            180,
            0,
            0,
            0,
            0,
            73,
            69,
            78,
            68,
            174,
            66,
            96,
            130
          ];

    return Stream<List<int>>.fromIterable([bytes]).listen(onData,
        onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }
}

void main() {
  late MockAuthService mockAuthService;
  late MockRideService mockRideService;

  setUp(() {
    HttpOverrides.global = MockHttpOverrides();
    mockAuthService = MockAuthService();
    mockRideService = MockRideService();

    // Default response for getCurrentRide
    when(() => mockRideService.getCurrentRide(any(), any()))
        .thenAnswer((_) async => null);
  });

  Widget createWidgetUnderTest() {
    return ProviderScope(
      overrides: [
        authServiceProvider.overrideWithValue(mockAuthService),
        rideServiceProvider.overrideWithValue(mockRideService),
      ],
      child: legacy_provider.MultiProvider(
        providers: [
          legacy_provider.ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );
  }

  testWidgets('shows error messages for empty fields', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.byType(ElevatedButton));
    await tester.pump(); // Let the state update

    expect(find.text('Please enter a valid email address'), findsOneWidget);
    expect(find.text('Please enter your password'), findsOneWidget);
  });

  testWidgets('navigates to HomeScreen on successful login', (tester) async {
    when(() =>
        mockAuthService.signIn(
            email: 'test@example.com',
            password: 'password')).thenAnswer((_) async =>
        AuthResult(isSignedIn: true, token: 'mock_token', user: {'id': '1'}));

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(
        find.byType(TextFormField).first, 'test@example.com');
    await tester.enterText(find.byType(TextFormField).last, 'password');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();
    await tester.pump(const Duration(seconds: 1));
    await tester.pump(const Duration(seconds: 1));

    expect(find.byType(HomeScreen), findsOneWidget);
  });

  testWidgets('shows error message on failed login', (tester) async {
    when(() => mockAuthService.signIn(
            email: 'test@example.com', password: 'wrong'))
        .thenAnswer((_) async => AuthResult(
            isSignedIn: false,
            error: 'Login failed. Please check your credentials.'));

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(
        find.byType(TextFormField).first, 'test@example.com');
    await tester.enterText(find.byType(TextFormField).last, 'wrong');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    expect(
      find.text('Login failed. Please check your credentials.'),
      findsOneWidget,
    );
  });
}
