import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../theme/app_theme.dart';

class RadarAnimation extends StatefulWidget {
  final bool isOnline;
  const RadarAnimation({super.key, required this.isOnline});

  @override
  State<RadarAnimation> createState() => _RadarAnimationState();
}

class _RadarAnimationState extends State<RadarAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    if (widget.isOnline) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(RadarAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isOnline && !_controller.isAnimating) {
      _controller.repeat();
    } else if (!widget.isOnline && _controller.isAnimating) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: RadarPainter(
            progress: _controller.value,
            color: AppTheme.primaryColor,
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

  RadarPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    final paint = Paint()
      ..color = color.withOpacity(0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Draw static rings
    for (int i = 1; i <= 3; i++) {
      canvas.drawCircle(center, radius * (i / 3), paint);
    }

    // Draw moving ring
    final movingPaint = Paint()
      ..color = color.withOpacity(1.0 - progress)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawCircle(center, radius * progress, movingPaint);

    // Draw sweep
    final sweepPaint = Paint()
      ..shader = SweepGradient(
        center: Alignment.center,
        startAngle: 0.0,
        endAngle: math.pi * 2,
        colors: [
          color.withOpacity(0.0),
          color.withOpacity(0.5),
          color.withOpacity(0.0),
        ],
        stops: const [0.0, 0.5, 1.0],
        transform: GradientRotation(progress * math.pi * 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    final sweepPath = Path()
      ..moveTo(center.dx, center.dy)
      ..arcTo(Rect.fromCircle(center: center, radius: radius), progress * math.pi * 2, math.pi / 4, false)
      ..close();
    
    canvas.drawCircle(center, radius, Paint()..shader = sweepPaint..style = PaintingStyle.fill);

    // Draw random "pings" (mock passengers)
    final pingPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    
    // Some deterministic "random" points based on progress
    final points = [
      Offset(center.dx + radius * 0.6 * math.cos(0.5), center.dy + radius * 0.6 * math.sin(0.5)),
      Offset(center.dx + radius * 0.4 * math.cos(2.1), center.dy + radius * 0.4 * math.sin(2.1)),
      Offset(center.dx + radius * 0.8 * math.cos(4.5), center.dy + radius * 0.8 * math.sin(4.5)),
    ];

    for (var point in points) {
      final distance = (point - center).direction;
      final sweepAngle = (progress * math.pi * 2) % (math.pi * 2);
      
      // Only show if the sweep is near the point
      double diff = (distance - sweepAngle).abs();
      if (diff > math.pi) diff = (2 * math.pi - diff).abs();
      
      if (diff < 0.5) {
        canvas.drawCircle(point, 4 * (1.0 - diff / 0.5), pingPaint..color = color.withOpacity(1.0 - diff / 0.5));
      }
    }
  }

  @override
  bool shouldRepaint(covariant RadarPainter oldDelegate) => true;
}
