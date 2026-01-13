import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';

class SwipeableOnlineButton extends StatefulWidget {
  final bool isOnline;
  final ValueChanged<bool> onStatusChanged;

  const SwipeableOnlineButton({
    super.key,
    required this.isOnline,
    required this.onStatusChanged,
  });

  @override
  State<SwipeableOnlineButton> createState() => _SwipeableOnlineButtonState();
}

class _SwipeableOnlineButtonState extends State<SwipeableOnlineButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _dragValue = 0.0;
  double _maxWidth = 0.0;
  static const double _thumbSize = 56.0;
  static const double _padding = 4.0;

  @override
  void didUpdateWidget(SwipeableOnlineButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.isOnline && oldWidget.isOnline) {
      setState(() {
        _dragValue = 0.0;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 300));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDragUpdate(DragUpdateDetails details) {
    if (widget.isOnline) return; // Disable dragging if already online?
    // Or allow dragging to go offline? Let's assume this specific request is for "Go Online"
    // If we want bidirectional, we need more logic.
    // For now, let's assume it's "Swipe to Go Online" and maybe tap/swipe to go offline is handled differently or same widget.

    // If online, let's treat it as a reset or allow "Swipe to Go Offline" (reverse)
    // But the prompt specifically describes the "Go Online" button.

    setState(() {
      _dragValue = (_dragValue + details.delta.dx)
          .clamp(0.0, _maxWidth - _thumbSize - (_padding * 2));
    });
  }

  void _onDragEnd(DragEndDetails details) {
    if (widget.isOnline) return;

    if (_dragValue > (_maxWidth - _thumbSize - (_padding * 2)) * 0.7) {
      // Threshold reached
      _dragValue = _maxWidth - _thumbSize - (_padding * 2);
      widget.onStatusChanged(true);
    } else {
      // Snap back
      final currentDrag = _dragValue;
      _controller.duration = const Duration(milliseconds: 200);
      Animation<double> animation =
          Tween<double>(begin: currentDrag, end: 0.0).animate(_controller);
      animation.addListener(() {
        setState(() {
          _dragValue = animation.value;
        });
      });
      _controller.forward(from: 0.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        _maxWidth = constraints.maxWidth;

        // If online, maybe just show a different state or lock it full?
        // Let's make it so if it IS online, it's fully expanded or transforms into a "Online" card.
        // But for swiping interaction, standard is:
        // Offline -> [ O --> ] -> Online

        return Container(
          height: _thumbSize + (_padding * 2),
          decoration: BoxDecoration(
              color: widget.isOnline ? AppTheme.primaryColor : Colors.grey[900],
              borderRadius: BorderRadius.circular(100),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 6))
              ]),
          child: Stack(
            children: [
              // 1. Text Background
              Center(
                child: Text(
                  widget.isOnline ? "YOU ARE ONLINE" : "SWIPE TO GO ONLINE",
                  style: TextStyle(
                      color: widget.isOnline
                          ? Colors.black // High contrast on Gold
                          : Colors.white.withValues(alpha: 0.5),
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      letterSpacing: 1.2),
                ),
              ),

              // 2. Slider Track/Thumb
              if (!widget.isOnline)
                Positioned(
                  left: _padding + _dragValue,
                  top: _padding,
                  bottom: _padding,
                  child: GestureDetector(
                    onHorizontalDragUpdate: _onDragUpdate,
                    onHorizontalDragEnd: _onDragEnd,
                    child: Container(
                      width: _thumbSize,
                      height: _thumbSize,
                      decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFFFD700), // Yellow
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 10,
                                spreadRadius: 2,
                                offset: const Offset(0, 4)),
                          ]),
                      child: const Center(
                        child: Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.black,
                          size: 32,
                        ),
                      ),
                    ),
                  ),
                ),

              if (widget.isOnline)
                Positioned(
                  right: _padding,
                  top: _padding,
                  bottom: _padding,
                  child: GestureDetector(
                    onTap: () => widget.onStatusChanged(false),
                    child: Container(
                      width: _thumbSize,
                      height: _thumbSize,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white, // White circle
                      ),
                      child: const Icon(Icons.power_settings_new,
                          color: Colors.red), // Red power icon
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
