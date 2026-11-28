import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../config/app_config.dart';

typedef MessageCallback = void Function(Map<String, dynamic> data);

class TripCommChannel {
  final String tripId;
  MessageCallback? onMessageReceived;
  io.Socket? _socket;
  bool _isDisposed = false;

  TripCommChannel(this.tripId) {
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
        debugPrint('💬 [Passenger TripCommChannel] Connected to chat gateway for trip $tripId');
        _socket?.emit('joinRoom', {'tripId': tripId});
      });

      _socket?.on('joinedRoom', (data) {
        debugPrint('💬 [Passenger TripCommChannel] Successfully joined trip room: $data');
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
        } catch (e) {
          debugPrint('💬 [Passenger TripCommChannel] Error parsing newMessage: $e');
        }
      });

      _socket?.on('callSignal', (data) {
        if (_isDisposed || data == null) return;
        try {
          final Map<String, dynamic> signalData =
              data is Map ? Map<String, dynamic>.from(data) : {};
          onMessageReceived?.call(signalData);
        } catch (e) {
          debugPrint('💬 [Passenger TripCommChannel] Error parsing callSignal: $e');
        }
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
        } catch (e) {
          debugPrint('💬 [Passenger TripCommChannel] Error parsing roomHistory: $e');
        }
      });

      _socket?.onDisconnect((_) {
        debugPrint('💬 [Passenger TripCommChannel] Disconnected from chat server');
      });

      _socket?.onError((err) {
        debugPrint('💬 [Passenger TripCommChannel] Socket error: $err');
      });
    } catch (e) {
      debugPrint('💬 [Passenger TripCommChannel] Socket initialization failed: $e');
    }
  }

  Future<String?> _resolveAuthToken() async {
    try {
      const storage = FlutterSecureStorage();
      for (final key in const ['jwt_token', 'auth_token', 'access_token', 'driver_token']) {
        final token = await storage.read(key: key);
        if (token != null && token.isNotEmpty) return token;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  void postMessage(Map<String, dynamic> message) {
    if (_isDisposed) return;
    try {
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
    } catch (e) {
      debugPrint('💬 [Passenger TripCommChannel] postMessage error: $e');
    }
  }

  void dispose() {
    _isDisposed = true;
    try {
      _socket?.emit('leaveRoom', {'tripId': tripId});
      _socket?.disconnect();
      _socket?.dispose();
      _socket = null;
    } catch (_) {}
  }
}
