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

  Future<bool> checkBatteryOptimization() async {
    try {
      final bool? isIgnoring =
          await _channel.invokeMethod<bool>('checkBatteryOptimization');
      return isIgnoring ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<void> requestIgnoreBatteryOptimization() async {
    try {
      await _channel.invokeMethod('requestIgnoreBatteryOptimization');
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

  /// Brings the driver app directly to the foreground (e.g. when an incoming trip arrives)
  Future<void> bringToForeground() async {
    try {
      await _channel.invokeMethod('bringToForeground');
    } catch (_) {}
  }
}
