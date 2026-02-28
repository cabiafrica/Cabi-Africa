import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

/// A utility to mock NetworkImage calls in tests.
/// This prevents NetworkImageLoadException (400) from failing tests.
class MockHttpClient extends Mock implements HttpClient {
  @override
  set autoUncompress(bool value) {}
}

class MockHttpClientRequest extends Mock implements HttpClientRequest {}

class MockHttpClientResponse extends Mock implements HttpClientResponse {}

class MockHttpHeaders extends Mock implements HttpHeaders {}

class MockHttpOverrides extends HttpOverrides {
  final HttpClient client;
  MockHttpOverrides(this.client);

  @override
  HttpClient createHttpClient(SecurityContext? context) => client;
}

/// Runs a test body with mocked network images.
/// It returns a transparent 1x1 pixel for all requests.
Future<void> provideMockedNetworkImages(
    Future<void> Function() testBody) async {
  final client = MockHttpClient();
  final request = MockHttpClientRequest();
  final response = MockHttpClientResponse();
  final headers = MockHttpHeaders();

  // Transparent 1x1 PNG
  final transparentImage = Uint8List.fromList([
    0x89,
    0x50,
    0x4E,
    0x47,
    0x0D,
    0x0A,
    0x1A,
    0x0A,
    0x00,
    0x00,
    0x00,
    0x0D,
    0x49,
    0x48,
    0x44,
    0x52,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x01,
    0x08,
    0x06,
    0x00,
    0x00,
    0x00,
    0x1F,
    0x15,
    0xC4,
    0x89,
    0x00,
    0x00,
    0x00,
    0x0A,
    0x49,
    0x44,
    0x41,
    0x54,
    0x08,
    0xD7,
    0x63,
    0x60,
    0x00,
    0x02,
    0x00,
    0x00,
    0x05,
    0x00,
    0x01,
    0x0D,
    0x26,
    0xE5,
    0x2E,
    0x00,
    0x00,
    0x00,
    0x00,
    0x49,
    0x45,
    0x4E,
    0x44,
    0xAE,
    0x42,
    0x60,
    0x82,
  ]);

  registerFallbackValue(Uri.parse('http://localhost'));

  when(() => client.getUrl(any())).thenAnswer((_) async => request);
  when(() => client.postUrl(any())).thenAnswer((_) async => request);
  when(() => client.putUrl(any())).thenAnswer((_) async => request);
  when(() => client.deleteUrl(any())).thenAnswer((_) async => request);
  when(() => client.patchUrl(any())).thenAnswer((_) async => request);
  when(() => client.headUrl(any())).thenAnswer((_) async => request);
  when(() => client.openUrl(any(), any())).thenAnswer((_) async => request);

  when(() => client.close(force: any(named: 'force'))).thenReturn(null);
  when(() => request.headers).thenReturn(headers);
  when(() => request.close()).thenAnswer((_) async => response);
  when(() => response.statusCode).thenReturn(HttpStatus.ok);
  when(() => response.contentLength).thenReturn(transparentImage.length);
  when(() => response.compressionState)
      .thenReturn(HttpClientResponseCompressionState.notCompressed);
  when(() => response.listen(
        any(),
        cancelOnError: any(named: 'cancelOnError'),
        onDone: any(named: 'onDone'),
        onError: any(named: 'onError'),
      )).thenAnswer((Invocation invocation) {
    final onData =
        invocation.positionalArguments[0] as void Function(List<int>);
    final onDone = invocation.namedArguments[#onDone] as void Function()?;
    final onError = invocation.namedArguments[#onError] as void Function(Object,
        [StackTrace?])?;
    final cancelOnError = invocation.namedArguments[#cancelOnError] as bool?;

    return Stream<List<int>>.fromIterable([transparentImage]).listen(
      onData,
      onDone: onDone,
      onError: onError,
      cancelOnError: cancelOnError,
    );
  });

  return HttpOverrides.runZoned(
    testBody,
    createHttpClient: (SecurityContext? context) => client,
  );
}
