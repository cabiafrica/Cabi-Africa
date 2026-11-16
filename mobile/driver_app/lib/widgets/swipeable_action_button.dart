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
    this.color = const Color(0xFFEF4444),
    this.iconColor = Colors.white,
    this.icon = Icons.flag_rounded,
  });

  @override
  State<SwipeableActionButton> createState() => _SwipeableActionButtonState();
}

class _SwipeableActionButtonState extends State<SwipeableActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _dragValue = 0.0;
  double _maxWidth = 0.0;
  static const double _thumbSize = 40.0;
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final chassisBg = isDark ? const Color(0xFF1B1A1A) : const Color(0xFFF7F5F0);
    final borderOutline = isDark
        ? widget.color.withValues(alpha: 0.28)
        : widget.color.withValues(alpha: 0.4);

    return LayoutBuilder(
      builder: (context, constraints) {
        _maxWidth = constraints.maxWidth;
        return Container(
          height: _thumbSize + (_padding * 2), // 48.0 px
          decoration: BoxDecoration(
            color: chassisBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderOutline, width: 1.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Label with trailing hint arrows
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.only(left: 36, right: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: Text(
                          widget.label.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: widget.color,
                            fontWeight: FontWeight.w800,
                            fontSize: 11.5,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.keyboard_double_arrow_right_rounded,
                        size: 14,
                        color: widget.color.withValues(alpha: 0.5),
                      ),
                    ],
                  ),
                ),
              ),

              // Draggable Slider Thumb
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
                      borderRadius: BorderRadius.circular(8),
                      gradient: LinearGradient(
                        colors: [
                          widget.color,
                          widget.color.withRed((widget.color.r * 255 * 0.85).round()),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3),
                        width: 1.0,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: widget.color.withValues(alpha: 0.4),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        widget.icon,
                        color: widget.iconColor,
                        size: 19,
                      ),
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
