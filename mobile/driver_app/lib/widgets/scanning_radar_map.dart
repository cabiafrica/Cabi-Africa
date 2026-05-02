import 'package:flutter/material.dart';
import 'dart:math' as math;

class ScanningRadarMap extends StatefulWidget {
  final double radiusInKm;
  final bool isScanning;
  final Duration scanDuration;
  final Widget mapWidget;

  const ScanningRadarMap({
    super.key,
    required this.radiusInKm,
    required this.isScanning,
    this.scanDuration = const Duration(minutes: 1), // One revolution per minute
    required this.mapWidget,
  });

  @override
  State<ScanningRadarMap> createState() => _ScanningRadarMapState();
}

class _ScanningRadarMapState extends State<ScanningRadarMap>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.scanDuration,
    );
    if (widget.isScanning) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(ScanningRadarMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isScanning != oldWidget.isScanning) {
      if (widget.isScanning) {
        _controller.repeat();
      } else {
        _controller.stop();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        widget.mapWidget,
        // Radar Circle Overlay
        if (widget.isScanning)
          IgnorePointer(
            child: CustomPaint(
              size: MediaQuery.of(context).size,
              painter: RadarPainter(
                animation: _controller,
                radiusContext: context, // To calculate pixel radius if needed
              ),
            ),
          ),
      ],
    );
  }
}

class RadarPainter extends CustomPainter {
  final Animation<double> animation;
  final BuildContext radiusContext;

  RadarPainter({required this.animation, required this.radiusContext})
      : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    // Just an example radius, ideally this would map to zoom level/meters
    final radius = size.width * 0.4;

    final paint = Paint()
      ..color = Colors.green.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Draw outer circle
    canvas.drawCircle(center, radius, paint);

    // Draw scanning sector
    final scanPaint = Paint()
      ..shader = SweepGradient(
        center: Alignment.center,
        startAngle: 0.0,
        endAngle: math.pi * 2,
        colors: [
          Colors.green.withValues(alpha: 0.0),
          Colors.green.withValues(alpha: 0.5),
        ],
        stops: const [0.8, 1.0],
        transform: GradientRotation(animation.value * math.pi * 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawCircle(center, radius, scanPaint);
  }

  @override
  bool shouldRepaint(covariant RadarPainter oldDelegate) {
    return true;
  }
}

