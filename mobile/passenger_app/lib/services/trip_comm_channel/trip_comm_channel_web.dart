// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../config/app_config.dart';

typedef MessageCallback = void Function(Map<String, dynamic> data);

class TripCommChannel {
  final String tripId;
  html.BroadcastChannel? _bc;
  io.Socket? _socket;
  MessageCallback? onMessageReceived;
  bool _isDisposed = false;

  TripCommChannel(this.tripId) {
    // 1. Local browser tab broadcast channel
    try {
      _bc = html.BroadcastChannel('cabi_trip_comm_$tripId');
      _bc?.onMessage.listen((event) {
        if (event.data != null) {
          try {
            final Map<String, dynamic> data = (event.data is Map)
                ? Map<String, dynamic>.from(event.data as Map)
                : jsonDecode(event.data.toString());
            onMessageReceived?.call(data);
          } catch (_) {}
        }
      });
    } catch (_) {}

    // 2. Real Socket.io connection to backend dispatch service
    _initSocket();
  }

  Future<void> _initSocket() async {
    try {
      final token = await _resolveAuthToken();
      if (_isDisposed) return;

      final socketUrl = '${AppConfig.socketUrl}/chat';
      final options = io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .setAuth({'token': token ?? 'mock-jwt'})
          .setExtraHeaders(token != null ? {'Authorization': 'Bearer $token'} : {})
          .build();

      _socket = io.io(socketUrl, options);

      _socket?.onConnect((_) {
        debugPrint('💬 [Web TripCommChannel] Connected to chat gateway for trip $tripId');
        _socket?.emit('joinRoom', {'tripId': tripId});
      });

      _socket?.on('newMessage', (data) {
        if (_isDisposed || data == null) return;
        try {
          final Map<String, dynamic> msgMap =
              data is Map ? Map<String, dynamic>.from(data) : {};
          final chatData = {
            'type': 'CHAT',
            'id': msgMap['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
            'tripId': msgMap['tripId'] ?? tripId,
            'senderName': msgMap['senderName'] ?? 'Driver',
            'senderRole': msgMap['senderRole'] ?? 'DRIVER',
            'text': msgMap['text'] ?? '',
            'timestamp': msgMap['timestamp'] ?? DateTime.now().toIso8601String(),
            'wasRedacted': msgMap['wasRedacted'] ?? false,
          };
          onMessageReceived?.call(chatData);
        } catch (_) {}
      });

      _socket?.on('callSignal', (data) {
        if (_isDisposed || data == null) return;
        try {
          final Map<String, dynamic> signalData =
              data is Map ? Map<String, dynamic>.from(data) : {};
          onMessageReceived?.call(signalData);
        } catch (_) {}
      });

      _socket?.on('roomHistory', (data) {
        if (_isDisposed || data == null) return;
        try {
          final history = data['history'] as List?;
          if (history != null) {
            for (final item in history) {
              final Map<String, dynamic> msgMap =
                  item is Map ? Map<String, dynamic>.from(item) : {};
              onMessageReceived?.call({
                'type': 'CHAT',
                'id': msgMap['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
                'tripId': msgMap['tripId'] ?? tripId,
                'senderName': msgMap['senderName'] ?? 'Driver',
                'senderRole': msgMap['senderRole'] ?? 'DRIVER',
                'text': msgMap['text'] ?? '',
                'timestamp': msgMap['timestamp'] ?? DateTime.now().toIso8601String(),
              });
            }
          }
        } catch (_) {}
      });
    } catch (e) {
      debugPrint('💬 [Web TripCommChannel] Socket init error: $e');
    }
  }

  Future<String?> _resolveAuthToken() async {
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'jwt_token');
      if (token != null && token.isNotEmpty) return token;
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('auth_token') ?? prefs.getString('access_token');
    } catch (_) {
      return null;
    }
  }

  void postMessage(Map<String, dynamic> message) {
    if (_isDisposed) return;
    try {
      // Local tab broadcast
      _bc?.postMessage(message);

      // Remote backend socket emit
      final type = message['type']?.toString();
      if (type == 'CHAT') {
        final text = message['text']?.toString() ?? '';
        if (text.isNotEmpty) {
          _socket?.emit('sendMessage', {
            'tripId': tripId,
            'text': text,
          });
        }
      } else if (type != null && type.startsWith('CALL_')) {
        _socket?.emit('callSignal', message);
      }
    } catch (_) {}
  }

  void dispose() {
    _isDisposed = true;
    try {
      _bc?.close();
      _socket?.emit('leaveRoom', {'tripId': tripId});
      _socket?.disconnect();
      _socket?.dispose();
      _socket = null;
    } catch (_) {}
  }
}
