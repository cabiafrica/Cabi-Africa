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
    if (widget.isOnline != oldWidget.isOnline) {
      // Reset drag value when status changes externally or after successful swipe
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
    final double maxDrag = _maxWidth - _thumbSize - (_padding * 2);
    setState(() {
      if (!widget.isOnline) {
        // Offline: Drag Right (positive dx) to go Online
        _dragValue = (_dragValue + details.delta.dx).clamp(0.0, maxDrag);
      } else {
        // Online: Drag Left (negative dx) to go Offline
        // We want _dragValue to be positive distance from Right edge.
        // Dragging left gives negative dx. So we need to subtract dx (or add -dx).
        _dragValue = (_dragValue - details.delta.dx).clamp(0.0, maxDrag);
      }
    });
  }

  void _onDragEnd(DragEndDetails details) {
    final double maxDrag = _maxWidth - _thumbSize - (_padding * 2);

    if (_dragValue > maxDrag * 0.7) {
      widget.onStatusChanged(!widget.isOnline);
      // Reset is handled in didUpdateWidget when parent updates state
    } else {
      _snapBack();
    }
  }

  void _snapBack() {
    _controller.stop(); // Stop any previous animation
    final double start = _dragValue;
    _controller.reset();

    // Create a simple animation from start to 0
    // We can't use the controller directly like previous complex logic easily
    // Let's just use a simple value listener for now or standard AnimationController drive

    Animation<double> animation = Tween<double>(begin: start, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    animation.addListener(() {
      setState(() {
        _dragValue = animation.value;
      });
    });

    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        _maxWidth = constraints.maxWidth;
        // recalculate maxDrag purely for build safety if needed, mostly used in interactions

        return Container(
          height: _thumbSize + (_padding * 2),
          width: double.infinity, // Ensure it takes full width
          decoration: BoxDecoration(
            color: widget.isOnline
                ? AppTheme.primaryColor
                : Colors.grey[900], // Green/Gold for Online
            borderRadius: BorderRadius.circular(100),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 8,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // 1. Label Text
              Text(
                widget.isOnline ? "SWIPE TO GO OFFLINE" : "SWIPE TO GO ONLINE",
                style: TextStyle(
                  color: widget.isOnline ? Colors.white : Colors.white54,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  letterSpacing: 1.0,
                ),
              ),

              // 2. Sliding Thumb
              Positioned(
                // If Offline: Left aligned, offset by _dragValue
                left: !widget.isOnline ? _padding + _dragValue : null,
                // If Online: Right aligned, offset by _dragValue
                right: widget.isOnline ? _padding + _dragValue : null,
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
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Icon(
                      widget.isOnline
                          ? Icons.power_settings_new
                          : Icons.arrow_forward,
                      color: widget.isOnline ? Colors.red : Colors.green,
                      size: 28,
                    ),
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
