import 'package:flutter/services.dart';

class FloatingBubbleService {
  static const MethodChannel _channel =
      MethodChannel('africa.cabi.driver/floating_bubble');

  static final FloatingBubbleService instance = FloatingBubbleService._();
  FloatingBubbleService._();

  Future<bool> checkPermission() async {
    try {
      final bool? hasPermission =
          await _channel.invokeMethod<bool>('checkOverlayPermission');
      return hasPermission ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<void> requestPermission() async {
    try {
      await _channel.invokeMethod('requestOverlayPermission');
    } catch (_) {}
  }

  Future<bool> showBubble() async {
    try {
      final bool? res = await _channel.invokeMethod<bool>('showBubble');
      return res ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<void> hideBubble() async {
    try {
      await _channel.invokeMethod('hideBubble');
    } catch (_) {}
  }
}
