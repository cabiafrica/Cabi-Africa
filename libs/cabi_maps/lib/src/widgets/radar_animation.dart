import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:async';

class RadarPing {
  final Offset position;
  final DateTime createdAt;

  RadarPing(this.position) : createdAt = DateTime.now();

  double get opacity {
    final age = DateTime.now().difference(createdAt).inMilliseconds / 1000.0;
    return math.max(0.0, 1.0 - (age / 2.0));
  }
}

class RadarAnimation extends StatefulWidget {
  final bool isOnline;
  final double radiusKm;
  final Color primaryColor;
  final Color secondaryColor;
  final String? label;
  final bool showTag;

  const RadarAnimation({
    super.key,
    required this.isOnline,
    this.radiusKm = 5.0,
    this.primaryColor = const Color(0xFFD4AF37),
    this.secondaryColor = const Color(0xFFF3E5AB),
    this.label,
    this.showTag = true,
  });

  @override
  State<RadarAnimation> createState() => _RadarAnimationState();
}

class _RadarAnimationState extends State<RadarAnimation>
    with SingleTickerProviderStateMixin {
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
    if (mounted) {
      setState(() {
        _pings.clear();
      });
    }
  }

  void _generateRandomPing() {
    if (!mounted || _random.nextDouble() > 0.4) return;

    final angle = _random.nextDouble() * 2 * math.pi;
    final distance = 0.2 + _random.nextDouble() * 0.7; // 20% to 90% from center

    final sweepAngle = (_controller.value * math.pi * 2);
    double diff = (angle - sweepAngle).abs();
    if (diff > math.pi) diff = (2 * math.pi - diff).abs();

    if (diff < 0.6) {
      setState(() {
        _pings.add(RadarPing(
            Offset(math.cos(angle) * distance, math.sin(angle) * distance)));
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
    final clampedKm = widget.radiusKm.clamp(1.0, 5.0);
    // Diameter is dynamically scaled (300px - 335px) to maximize screen utilization
    final targetDiameter = 300.0 + ((clampedKm - 1.0) / 4.0) * 35.0;

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: targetDiameter, end: targetDiameter),
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
      builder: (context, animatedDiameter, child) {
        return SizedBox(
          width: animatedDiameter,
          height: animatedDiameter,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return CustomPaint(
                    size: Size(animatedDiameter, animatedDiameter),
                    painter: RadarPainter(
                      progress: _controller.value,
                      color: widget.primaryColor,
                      pings: _pings,
                      radiusKm: clampedKm,
                    ),
                  );
                },
              ),
              // Radius Indicator Tag floating at top edge of the radar perimeter
              if (widget.showTag)
                Positioned(
                  top: -12,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF141414),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: widget.primaryColor.withValues(alpha: 0.6),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: widget.primaryColor.withValues(alpha: 0.2),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.radar_rounded,
                            size: 11, color: widget.primaryColor),
                        const SizedBox(width: 4),
                        Text(
                          widget.label ?? '${clampedKm.toStringAsFixed(1)} KM PICKUP',
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w900,
                            color: widget.secondaryColor,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
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
  final double radiusKm;

  RadarPainter({
    required this.progress,
    required this.color,
    required this.pings,
    required this.radiusKm,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Outer boundary ring representing the exact driver pick-up perimeter
    final perimeterPaint = Paint()
      ..color = color.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawCircle(center, radius, perimeterPaint);

    // Subtle golden fill inside pick-up zone
    final zoneFillPaint = Paint()
      ..color = color.withValues(alpha: 0.04)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, zoneFillPaint);

    // Concentric intermediate range rings (e.g. 1/3, 2/3)
    final ringPaint = Paint()
      ..color = color.withValues(alpha: 0.15)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    for (int i = 1; i <= 2; i++) {
      canvas.drawCircle(center, radius * (i / 3), ringPaint);
    }

    // Expanding active radar wave
    final movingPaint = Paint()
      ..color = color.withValues(alpha: 0.8 * (1.0 - progress))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawCircle(center, radius * progress, movingPaint);

    // Radar scanning sweep
    final sweepShader = SweepGradient(
      center: Alignment.center,
      startAngle: 0.0,
      endAngle: math.pi * 2,
      colors: [
        color.withValues(alpha: 0.0),
        color.withValues(alpha: 0.35),
        color.withValues(alpha: 0.0),
      ],
      stops: const [0.0, 0.5, 1.0],
      transform: GradientRotation(progress * math.pi * 2),
    ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..shader = sweepShader
        ..style = PaintingStyle.fill,
    );

    // Radar dynamic pings
    final pingPaint = Paint()..style = PaintingStyle.fill;
    for (var ping in pings) {
      final op = ping.opacity;
      if (op > 0) {
        final point = Offset(
          center.dx + ping.position.dx * radius,
          center.dy + ping.position.dy * radius,
        );
        canvas.drawCircle(
            point, 4 * op + 2, pingPaint..color = color.withValues(alpha: op));
        canvas.drawCircle(
            point, 2, pingPaint..color = Colors.white.withValues(alpha: op));
      }
    }
  }

  @override
  bool shouldRepaint(covariant RadarPainter oldDelegate) => true;
}
