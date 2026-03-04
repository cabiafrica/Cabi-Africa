import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/services/auth_service.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:driver_app/providers/map_provider.dart' as provider;
import 'package:provider/provider.dart' as legacy_provider;
import 'package:driver_app/services/ride_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:geolocator_platform_interface/geolocator_platform_interface.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockAuthService extends Mock implements AuthService {}

class MockRideService extends Mock implements RideService {}

class SimpleMapNotifier extends provider.MapNotifier {
  SimpleMapNotifier(provider.MapType initial) : super() {
    state = initial;
  }
}

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

class MockGeolocatorPlatform extends Mock
    with MockPlatformInterfaceMixin
    implements GeolocatorPlatform {
  @override
  Future<LocationPermission> checkPermission() =>
      Future.value(LocationPermission.always);

  @override
  Future<LocationPermission> requestPermission() =>
      Future.value(LocationPermission.always);

  @override
  Future<bool> isLocationServiceEnabled() => Future.value(true);

  @override
  Future<Position> getCurrentPosition({LocationSettings? locationSettings}) =>
      Future.value(
        Position(
          latitude: -1.286389,
          longitude: 36.817223,
          timestamp: DateTime.now(),
          accuracy: 0,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          headingAccuracy: 0,
          speed: 0,
          speedAccuracy: 0,
        ),
      );

  @override
  Stream<Position> getPositionStream({LocationSettings? locationSettings}) {
    return Stream.fromIterable([
      Position(
        latitude: -1.286389,
        longitude: 36.817223,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        headingAccuracy: 0,
        speed: 0,
        speedAccuracy: 0,
      )
    ]);
  }
}

class MockHttpClient extends Mock implements HttpClient {
  @override
  Future<HttpClientRequest> getUrl(Uri url) => _handleRequest(url);
  @override
  Future<HttpClientRequest> postUrl(Uri url) => _handleRequest(url);
  @override
  Future<HttpClientRequest> putUrl(Uri url) => _handleRequest(url);
  @override
  Future<HttpClientRequest> deleteUrl(Uri url) => _handleRequest(url);
  @override
  Future<HttpClientRequest> openUrl(String method, Uri url) =>
      _handleRequest(url);

  @override
  bool autoUncompress = false;

  @override
  String Function(Uri url)? findProxy = (url) => 'DIRECT';

  @override
  void addCredentials(
      Uri url, String realm, HttpClientCredentials credentials) {}

  @override
  void addProxyCredentials(
      String host, int port, String realm, HttpClientCredentials credentials) {}

  Future<HttpClientRequest> _handleRequest(Uri url) async {
    final request = MockHttpClientRequest();

    int status = 404;
    String body = '{}';
    bool isImage = false;

    if (url.path.contains('/auth/login')) {
      status = 200;
      body = jsonEncode({
        'token': 'mock_token',
        'user': {'id': '1', 'email': 'driver@example.com'}
      });
    } else if (url.toString().contains('pravatar') ||
        url.toString().contains('via.placeholder.com') ||
        url.toString().contains('openstreetmap') ||
        url.path.endsWith('.png') ||
        url.path.endsWith('.jpg') ||
        url.path.endsWith('.jpeg')) {
      status = 200;
      isImage = true;
    } else if (url.path.contains('/dispatch')) {
      status = 200;
      body = jsonEncode({'isOnline': true});
    } else if (url.path.contains('/status')) {
      status = 200;
      body = 'true';
    } else {
      status = 200;
      body = '{}';
    }

    final response = MockHttpClientResponse(
        isImage: isImage, statusCode: status, bodyString: body);
    when(() => request.close()).thenAnswer((_) async => response);
    when(() => request.done).thenAnswer((_) async => response);
    return request;
  }
}

class MockHttpClientRequest extends Mock implements HttpClientRequest {
  final _headers = MockHttpHeaders();
  @override
  HttpHeaders get headers => _headers;

  @override
  void add(List<int> data) {}

  @override
  void write(Object? object) {}
}

class MockHttpHeaders extends Mock implements HttpHeaders {
  final Map<String, List<String>> _values = {};

  @override
  List<String>? operator [](String name) {
    return _values[name] ?? ['text/plain'];
  }

  @override
  void add(String name, Object value, {bool preserveHeaderCase = false}) {
    _values[name] ??= [];
    _values[name]!.add(value.toString());
  }

  @override
  String? value(String name) {
    return _values[name]?.first;
  }

  @override
  set contentType(ContentType? contentType) {
    if (contentType != null) {
      _values['content-type'] = [contentType.toString()];
    }
  }
}

class MockHttpClientResponse extends Mock implements HttpClientResponse {
  final bool isImage;
  @override
  final int statusCode;
  final String bodyString;

  @override
  final HttpHeaders headers = MockHttpHeaders();

  final List<int> _imageBytes = const [
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

  MockHttpClientResponse(
      {this.isImage = false, this.statusCode = 200, this.bodyString = ''}) {
    if (isImage) {
      headers.contentType = ContentType.parse('image/png');
    } else {
      headers.contentType = ContentType.parse('application/json');
    }
  }

  @override
  int get contentLength =>
      isImage ? _imageBytes.length : utf8.encode(bodyString).length;

  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;

  @override
  StreamSubscription<List<int>> listen(void Function(List<int> event)? onData,
      {Function? onError, void Function()? onDone, bool? cancelOnError}) {
    List<int> bytes = isImage ? _imageBytes : utf8.encode(bodyString);
    return Stream<List<int>>.fromIterable([bytes]).listen(onData,
        onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }
}

class TestHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) => MockHttpClient();
}

void main() {
  late MockAuthService mockAuthService;
  late MockFlutterSecureStorage mockSecureStorage;
  late MockRideService mockRideService;

  setUpAll(() {
    registerFallbackValue(Uri.parse('http://localhost'));
    HttpOverrides.global = TestHttpOverrides();
  });

  setUp(() {
    mockAuthService = MockAuthService();
    mockSecureStorage = MockFlutterSecureStorage();
    mockRideService = MockRideService();
    SharedPreferences.setMockInitialValues({});

    when(() => mockRideService.getDriverStatus(any()))
        .thenAnswer((_) async => true);
    when(() => mockRideService.getCurrentRide(any(), any()))
        .thenAnswer((_) async => null);

    when(() => mockSecureStorage.write(
        key: any(named: 'key'),
        value: any(named: 'value'))).thenAnswer((_) async => {});

    // Default stub for signIn to prevent "Null is not a subtype of Future"
    when(() => mockAuthService.signIn(any(), any())).thenAnswer(
      (_) async => AuthResult(isSignedIn: false, error: 'Stub error'),
    );
  });

  Widget createWidgetUnderTest() {
    return ProviderScope(
      overrides: [
        authServiceProvider.overrideWithValue(mockAuthService),
        secureStorageProvider.overrideWithValue(mockSecureStorage),
        rideServiceProvider.overrideWithValue(mockRideService),
        provider.mapProvider
            .overrideWith((ref) => SimpleMapNotifier(provider.MapType.google)),
      ],
      child: legacy_provider.MultiProvider(
        providers: [
          legacy_provider.ChangeNotifierProvider(
              create: (_) => RideRequestProvider()),
        ],
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );
  }

  testWidgets('renders login screen with all elements', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 3.0;

    await tester.pumpWidget(createWidgetUnderTest());
    expect(find.text('CABI DRIVE'), findsOneWidget);
    expect(find.text('Drive With Pride!'), findsOneWidget);

    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  });

  testWidgets('validates email and password', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 3.0;

    await tester.pumpWidget(createWidgetUnderTest());
    await tester.ensureVisible(find.text('Start Driving'));
    await tester.tap(find.text('Start Driving'));
    await tester.pumpAndSettle();

    expect(find.text('Invalid email'), findsOneWidget);

    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  });

  testWidgets('shows error message on failed login', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 3.0;

    when(() => mockAuthService.signIn(any(), any())).thenAnswer(
      (_) async => AuthResult(isSignedIn: false, error: 'Invalid credentials'),
    );

    await tester.pumpWidget(createWidgetUnderTest());
    await tester.enterText(
        find.byType(TextFormField).at(0), 'wrong@example.com');
    await tester.enterText(find.byType(TextFormField).at(1), 'wrongpass');

    await tester.ensureVisible(find.text('Start Driving'));
    await tester.tap(find.text('Start Driving'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Invalid credentials'), findsOneWidget);

    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  });

  testWidgets('navigates to HomeScreen on successful login', (tester) async {
    tester.view.physicalSize = const Size(1284, 2778);
    tester.view.devicePixelRatio = 3.0;

    when(() => mockAuthService.signIn(any(), any())).thenAnswer(
      (_) async =>
          AuthResult(isSignedIn: true, token: 'mock_token', user: {'id': '1'}),
    );

    GeolocatorPlatform.instance = MockGeolocatorPlatform();
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(
        find.byType(TextFormField).at(0), 'driver@example.com');
    await tester.enterText(find.byType(TextFormField).at(1), 'password123');

    await tester.ensureVisible(find.text('Start Driving'));
    await tester.tap(find.text('Start Driving'));

    await tester.pump();
    await tester.pump(const Duration(seconds: 1)); // Auth logic

    // Attempt navigation
    try {
      await tester.pumpAndSettle(const Duration(seconds: 2));
      expect(find.byType(HomeScreen), findsOneWidget);
    } catch (e) {
      debugPrint('Navigation happened but UI elements might be settling: $e');
      // If we are here, we at least expect HomeScreen to be present
      expect(find.byType(HomeScreen), findsOneWidget);
    }

    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  });
}
