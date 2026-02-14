import 'package:flutter/material.dart';

class SwipeableActionButton extends StatefulWidget {
  final String label;
  final VoidCallback onAction;
  final Color color;
  final Color iconColor;
  final IconData icon;

  const SwipeableActionButton({
    super.key,
    required this.label,
    required this.onAction,
    this.color = Colors.red,
    this.iconColor = Colors.white,
    this.icon = Icons.navigate_next,
  });

  @override
  State<SwipeableActionButton> createState() => _SwipeableActionButtonState();
}

class _SwipeableActionButtonState extends State<SwipeableActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _dragValue = 0.0;
  double _maxWidth = 0.0;
  static const double _thumbSize = 56.0;
  static const double _padding = 4.0;
  bool _isCompleted = false;

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
    if (_isCompleted) return;
    setState(() {
      _dragValue = (_dragValue + details.delta.dx)
          .clamp(0.0, _maxWidth - _thumbSize - (_padding * 2));
    });
  }

  void _onDragEnd(DragEndDetails details) {
    if (_isCompleted) return;
    if (_dragValue > (_maxWidth - _thumbSize - (_padding * 2)) * 0.7) {
      // Threshold reached
      setState(() {
        _dragValue = _maxWidth - _thumbSize - (_padding * 2);
        _isCompleted = true;
      });
      widget.onAction();
    } else {
      // Snap back
      _snapBack();
    }
  }

  void _snapBack() {
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

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        _maxWidth = constraints.maxWidth;
        return Container(
          height: _thumbSize + (_padding * 2),
          decoration: BoxDecoration(
            color: widget.color.withValues(alpha: 0.2), // Light background
            borderRadius: BorderRadius.circular(100),
          ),
          child: Stack(
            children: [
              // Label
              Center(
                child: Text(
                  widget.label.toUpperCase(),
                  style: TextStyle(
                    color: widget.color,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              // Slider
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
                      color: widget.color,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: Icon(
                      widget.icon,
                      color: widget.iconColor,
                      size: 32,
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
