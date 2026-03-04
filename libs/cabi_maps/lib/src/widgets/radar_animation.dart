import 'package:flutter/material.dart';

class RadarAnimation extends StatefulWidget {
  final Color color;
  final double size;
  const RadarAnimation({
    super.key,
    this.color = const Color(0xFFFFD700),
    this.size = 200.0,
  });

  @override
  State<RadarAnimation> createState() => _RadarAnimationState();
}

class _RadarAnimationState extends State<RadarAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
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
        return Stack(
          alignment: Alignment.center,
          children: List.generate(3, (index) {
            final animationValue = (_controller.value + index / 3) % 1.0;
            return Container(
              width: widget.size * animationValue,
              height: widget.size * animationValue,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: widget.color
                      .withValues(alpha: 0.6 * (1.0 - animationValue)),
                  width: 1.5,
                ),
                color: widget.color
                    .withValues(alpha: 0.1 * (1.0 - animationValue)),
              ),
            );
          }),
        );
      },
    );
  }
}
