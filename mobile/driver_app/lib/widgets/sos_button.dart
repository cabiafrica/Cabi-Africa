import 'package:flutter/material.dart';

class SosButton extends StatefulWidget {
  final VoidCallback onDistressSignal;
  final VoidCallback onEmergencyParams;

  const SosButton({
    super.key,
    required this.onDistressSignal,
    required this.onEmergencyParams,
  });

  @override
  State<SosButton> createState() => _SosButtonState();
}

class _SosButtonState extends State<SosButton> {
  // Triple tap logic
  int _tapCount = 0;
  DateTime? _lastTapTime;

  // Slide logic - Vertical slide UP
  double _dragValue = 0.0;
  static const double _maxSlide = 60.0; // Distance to slide up

  void _handleTap() {
    final now = DateTime.now();
    if (_lastTapTime == null ||
        now.difference(_lastTapTime!) > const Duration(seconds: 1)) {
      _tapCount = 1;
    } else {
      _tapCount++;
    }
    _lastTapTime = now;

    if (_tapCount >= 3) {
      widget.onEmergencyParams();
      _tapCount = 0;
    }
  }

  void _onVerticalDragUpdate(DragUpdateDetails details) {
    // details.primaryDelta is negative when dragging UP
    setState(() {
      // Clamp between 0 (bottom) and _maxSlide (top)
      // Dragging up increases the "progress" visually, but delta y is negative
      double delta = -details.delta.dy;
      _dragValue = (_dragValue + delta).clamp(0.0, _maxSlide);
    });
  }

  void _onVerticalDragEnd(DragEndDetails details) {
    if (_dragValue >= _maxSlide * 0.8) {
      // Threshold reached for distress signal
      widget.onDistressSignal();
    }

    // Animate back to bottom
    // For simplicity in a short snippet, we just reset state.
    // Ideally use AnimationController for smooth return
    setState(() {
      _dragValue = 0.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 60 + _maxSlide, // Room to slide up
      width: 60,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          // Background track (optional visual cue)
          Container(
            height: 60 + _maxSlide,
            width: 4,
            decoration: BoxDecoration(
              color: Colors.red.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // The Button
          Positioned(
            bottom: _dragValue,
            child: GestureDetector(
              onTap: _handleTap,
              onVerticalDragUpdate: _onVerticalDragUpdate,
              onVerticalDragEnd: _onVerticalDragEnd,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                    color: const Color(0xFFD32F2F), // Red
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 10,
                          spreadRadius: 1,
                          offset: const Offset(0, 5))
                    ]),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.sos, color: Colors.white, size: 24),
                      if (_dragValue > 10) // Hide text when sliding up
                        const SizedBox.shrink()
                      else
                        const Text("SOS",
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold))
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
