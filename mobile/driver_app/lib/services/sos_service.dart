import 'package:dio/dio.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class SosService {
  final Dio _dio;

  SosService({Dio? dio}) : _dio = dio ?? Dio();

  Future<void> activateSos(String tripId, Map<String, double> position) async {
    final response = await _dio.post(
      'http://10.0.2.2:3333/api/sos', // Mock API
      data: {
        'tripId': tripId,
        'lat': position['lat'],
        'lng': position['lng'],
        'timestamp': DateTime.now().toIso8601String(),
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to activate SOS');
    }
  }

  WebSocketChannel connectAudioStream(String tripId) {
    // Mock WebSocket connection
    final uri = Uri.parse('ws://10.0.2.2:3333/sos/audio/$tripId');
    return WebSocketChannel.connect(uri);
  }
}
