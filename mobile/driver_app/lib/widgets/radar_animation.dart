import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:async';
import '../theme/app_theme.dart';

class RadarPing {
  final Offset position;
  final DateTime createdAt;

  RadarPing(this.position) : createdAt = DateTime.now();

  double get opacity {
    final age = DateTime.now().difference(createdAt).inMilliseconds / 1000.0;
    // Fade out over 2 seconds
    return math.max(0.0, 1.0 - (age / 2.0));
  }
}

class RadarAnimation extends StatefulWidget {
  final bool isOnline;
  const RadarAnimation({super.key, required this.isOnline});

  @override
  State<RadarAnimation> createState() => _RadarAnimationState();
}

class _RadarAnimationState extends State<RadarAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<RadarPing> _pings = [];
  Timer? _pingTimer;
  final math.Random _random = math.Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    if (widget.isOnline) {
      _startRadar();
    }
  }

  void _startRadar() {
    _controller.repeat();
    _pingTimer = Timer.periodic(const Duration(milliseconds: 300), (timer) {
      _generateRandomPing();
    });
  }

  void _stopRadar() {
    _controller.stop();
    _pingTimer?.cancel();
    setState(() {
      _pings.clear();
    });
  }

  void _generateRandomPing() {
    // Only occasionally generate a ping (40% chance per tick) to make it organic
    if (_random.nextDouble() > 0.4) return;

    final angle = _random.nextDouble() * 2 * math.pi;
    final distance = 0.2 + _random.nextDouble() * 0.7; // 20% to 90% from center
    
    // We add a ping when the sweep is near that angle
    final sweepAngle = (_controller.value * math.pi * 2);
    
    double diff = (angle - sweepAngle).abs();
    if (diff > math.pi) diff = (2 * math.pi - diff).abs();

    // If sweep is passing over this point, add a ping
    if (diff < 0.6) {
      setState(() {
        _pings.add(RadarPing(Offset(math.cos(angle) * distance, math.sin(angle) * distance)));
        // Cleanup old pings
        _pings.removeWhere((p) => p.opacity <= 0.0);
      });
    }
  }

  @override
  void didUpdateWidget(RadarAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isOnline && !_controller.isAnimating) {
      _startRadar();
    } else if (!widget.isOnline && _controller.isAnimating) {
      _stopRadar();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _pingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // Also force a rebuild occasionally to fade out pings even when animation sweeps past
        return CustomPaint(
          painter: RadarPainter(
            progress: _controller.value,
            color: AppTheme.primaryColor,
            pings: _pings,
          ),
          child: const SizedBox(
            width: 200,
            height: 200,
          ),
        );
      },
    );
  }
}

class RadarPainter extends CustomPainter {
  final double progress;
  final Color color;
  final List<RadarPing> pings;

  RadarPainter({required this.progress, required this.color, required this.pings});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    final paint = Paint()
      ..color = color.withValues(alpha: 0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Draw static rings
    for (int i = 1; i <= 3; i++) {
      canvas.drawCircle(center, radius * (i / 3), paint);
    }

    // Draw moving ring
    final movingPaint = Paint()
      ..color = color.withValues(alpha: 1.0 - progress)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawCircle(center, radius * progress, movingPaint);

    // Draw sweep
    final sweepShader = SweepGradient(
        center: Alignment.center,
        startAngle: 0.0,
        endAngle: math.pi * 2,
        colors: [
          color.withValues(alpha: 0.0),
          color.withValues(alpha: 0.5),
          color.withValues(alpha: 0.0),
        ],
        stops: const [0.0, 0.5, 1.0],
        transform: GradientRotation(progress * math.pi * 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawCircle(center, radius, Paint()..shader = sweepShader..style = PaintingStyle.fill);

    // Draw dynamic pings
    final pingPaint = Paint()
      ..style = PaintingStyle.fill;
    
    for (var ping in pings) {
      final op = ping.opacity;
      if (op > 0) {
        final point = Offset(
          center.dx + ping.position.dx * radius,
          center.dy + ping.position.dy * radius
        );
        // Pulse effect
        canvas.drawCircle(point, 4 * op + 2, pingPaint..color = color.withValues(alpha: op));
        canvas.drawCircle(point, 2, pingPaint..color = Colors.white.withValues(alpha: op));
      }
    }
  }

  @override
  bool shouldRepaint(covariant RadarPainter oldDelegate) => true;
}
