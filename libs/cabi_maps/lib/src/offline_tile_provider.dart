import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';

/// Pre-bundled rural Kenya transit corridors & hub coordinates
class KenyaHubCoords {
  static const nairobi = {'lat': -1.286389, 'lng': 36.817223, 'name': 'Nairobi Hub'};
  static const nakuru = {'lat': -0.303099, 'lng': 36.080025, 'name': 'Nakuru Gateway'};
  static const kisumu = {'lat': -0.102212, 'lng': 34.761713, 'name': 'Kisumu Port'};
  static const mombasa = {'lat': -4.043477, 'lng': 39.668206, 'name': 'Mombasa Coast'};
  static const eldoret = {'lat': 0.514277, 'lng': 35.269780, 'name': 'Eldoret Highland'};
  static const naivasha = {'lat': -0.717178, 'lng': 36.431026, 'name': 'Naivasha Junction'};
}

/// Dynamic offline monochrome tile generator for rural & low-connectivity zones
class CabiOfflineTileProvider extends TileProvider {
  final bool isDark;

  CabiOfflineTileProvider({this.isDark = true});

  @override
  ImageProvider getImage(TileCoordinates coordinates, TileLayer options) {
    // Return dynamically painted high-contrast vector grid tile for rural offline operation
    return _OfflineGridImageProvider(
      x: coordinates.x,
      y: coordinates.y,
      z: coordinates.z,
      isDark: isDark,
    );
  }

  /// Check if coordinate falls within Kenya bounds
  static bool isInKenya(double lat, double lng) {
    return lat >= -4.7 && lat <= 5.0 && lng >= 33.9 && lng <= 41.9;
  }
}

class _OfflineGridImageProvider extends ImageProvider<_OfflineGridKey> {
  final int x;
  final int y;
  final int z;
  final bool isDark;

  const _OfflineGridImageProvider({
    required this.x,
    required this.y,
    required this.z,
    required this.isDark,
  });

  @override
  Future<_OfflineGridKey> obtainKey(ImageConfiguration configuration) {
    return Future.value(_OfflineGridKey(x: x, y: y, z: z, isDark: isDark));
  }

  @override
  ImageStreamCompleter loadImage(_OfflineGridKey key, ImageDecoderCallback decode) {
    return OneFrameImageStreamCompleter(_generateTileImage(key));
  }

  Future<ImageInfo> _generateTileImage(_OfflineGridKey key) async {
    const size = 256.0;
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder, const Rect.fromLTWH(0, 0, size, size));

    // Base background
    final bgPaint = Paint()
      ..color = key.isDark ? const Color(0xFF0F0E0E) : const Color(0xFFF1F5F9)
      ..style = PaintingStyle.fill;
    canvas.drawRect(const Rect.fromLTWH(0, 0, size, size), bgPaint);

    // Arterial grid lines
    final gridPaint = Paint()
      ..color = key.isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    const step = 64.0;
    for (double i = 0; i <= size; i += step) {
      canvas.drawLine(Offset(i, 0), Offset(i, size), gridPaint);
      canvas.drawLine(Offset(0, i), Offset(size, i), gridPaint);
    }

    // Main corridor arterial representation
    final roadPaint = Paint()
      ..color = key.isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    final mid = size / 2;
    canvas.drawLine(Offset(0, mid), Offset(size, mid), roadPaint);
    canvas.drawLine(Offset(mid, 0), Offset(mid, size), roadPaint);

    final picture = recorder.endRecording();
    final img = await picture.toImage(size.toInt(), size.toInt());

    return ImageInfo(image: img);
  }
}

class _OfflineGridKey {
  final int x;
  final int y;
  final int z;
  final bool isDark;

  const _OfflineGridKey({
    required this.x,
    required this.y,
    required this.z,
    required this.isDark,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is _OfflineGridKey &&
          x == other.x &&
          y == other.y &&
          z == other.z &&
          isDark == other.isDark;

  @override
  int get hashCode => Object.hash(x, y, z, isDark);
}
