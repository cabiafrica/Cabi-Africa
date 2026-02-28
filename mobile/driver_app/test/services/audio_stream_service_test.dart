import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'package:driver_app/services/audio_stream_service.dart';

class MockWebSocketChannel extends Mock implements WebSocketChannel {}

class MockWebSocketSink extends Mock implements WebSocketSink {}

void main() {
  late AudioStreamService audioStreamService;
  late MockWebSocketChannel mockWebSocketChannel;
  late MockWebSocketSink mockWebSocketSink;

  setUp(() {
    audioStreamService = AudioStreamService();
    mockWebSocketChannel = MockWebSocketChannel();
    mockWebSocketSink = MockWebSocketSink();

    // Stub the sink property of the channel
    when(() => mockWebSocketChannel.sink).thenReturn(mockWebSocketSink);
    when(() => mockWebSocketSink.close()).thenAnswer((_) async => {});
    when(() => mockWebSocketSink.add(any())).thenReturn(null);

    // Inject the mock channel factory
    audioStreamService.channelFactory = (Uri uri) => mockWebSocketChannel;
  });

  group('AudioStreamService', () {
    test(
      'startStreaming returns false and does not connect if permission is denied',
      () async {
        // Arrange
        audioStreamService.permissionRequester = () async => false;

        // Act
        final result = await audioStreamService.startStreaming('ride-123');

        // Assert
        expect(result, isFalse);
        // Verify that the WebSocket connection was never attempted
        verifyNever(() => mockWebSocketChannel.sink);
      },
    );

    test(
      'startStreaming returns true and connects to WebSocket if permission is granted',
      () async {
        // Arrange
        audioStreamService.permissionRequester = () async => true;

        // Act
        final result = await audioStreamService.startStreaming('ride-123');

        // Assert
        expect(result, isTrue);
        // Verify that some data was sent to the sink
        verify(() => mockWebSocketSink.add(any())).called(2);
      },
    );

    test('stopStreaming closes the WebSocket sink if it exists', () async {
      // Arrange: First, successfully start streaming to create the channel
      audioStreamService.permissionRequester = () async => true;
      await audioStreamService.startStreaming('ride-123');

      // Act
      audioStreamService.stopStreaming();

      // Assert
      verify(() => mockWebSocketSink.close()).called(1);
    });

    test('stopStreaming does not throw error if channel does not exist', () {
      // Arrange: The channel is null by default
      // Act & Assert
      expect(() => audioStreamService.stopStreaming(), returnsNormally);
    });
  });
}
