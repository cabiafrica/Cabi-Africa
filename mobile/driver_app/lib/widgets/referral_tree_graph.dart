import 'dart:math';
import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';

class ReferralTreeGraph extends StatelessWidget {
  final int level1Count;
  final int level2Count;
  final String userImageUrl;

  const ReferralTreeGraph({
    super.key,
    required this.level1Count,
    required this.level2Count,
    this.userImageUrl = 'https://i.pravatar.cc/150?u=driver',
  });

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1,
      child: CustomPaint(
        painter: _ReferralTreePainter(
          level1Count: level1Count,
          level2Count: level2Count,
          context: context,
        ),
        child: Center(
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.primaryColor, // Center color
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 10,
                )
              ],
              border: Border.all(color: Colors.white, width: 3),
            ),
            child: ClipOval(
              child: Image.network(
                userImageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    const Icon(Icons.person, color: Colors.white, size: 40),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ReferralTreePainter extends CustomPainter {
  final int level1Count;
  final int level2Count;
  final BuildContext context;

  _ReferralTreePainter({
    required this.level1Count,
    required this.level2Count,
    required this.context,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    // Rings configuration
    final ring1Radius = size.width * 0.28;
    final ring1Width = size.width * 0.18;

    final ring2Radius = size.width * 0.45;
    final ring2Width = size.width * 0.18;

    final paint = Paint()..style = PaintingStyle.fill;

    // Draw Ring 2 (Outer)
    paint.color =
        const Color(0x80FFF59D); // Very light yellow
    canvas.drawCircle(center, ring2Radius, paint);

    // Draw Ring 1 (Inner)
    paint.color =
        const Color(0xB3FFEE58); // Light yellow
    canvas.drawCircle(center, ring1Radius, paint);

    // Draw Nodes for Level 2
    _drawNodesOnRing(canvas, center, ring2Radius - (ring2Width * 0.3),
        level2Count, Colors.orange.shade300, 6);

    // Draw Nodes for Level 1
    _drawNodesOnRing(canvas, center, ring1Radius - (ring1Width * 0.3),
        level1Count, Colors.orange.shade700, 8);
  }

  void _drawNodesOnRing(Canvas canvas, Offset center, double radius, int count,
      Color color, double nodeRadius) {
    if (count == 0) return;

    final nodePaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final shadowPaint = Paint()
      ..color = const Color(0x1A000000)
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2);

    // Limit visible nodes to avoid overcrowding visually
    final visibleCount = min(count, 30);
    final angleStep = (2 * pi) / visibleCount;

    for (var i = 0; i < visibleCount; i++) {
      final angle = i * angleStep - (pi / 2); // Start from top
      final x = center.dx + radius * cos(angle);
      final y = center.dy + radius * sin(angle);
      final position = Offset(x, y);

      canvas.drawCircle(position, nodeRadius, shadowPaint);
      canvas.drawCircle(position, nodeRadius, nodePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}


