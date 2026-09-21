import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:driver_app/theme/app_theme.dart';

class SwipeableOnlineButton extends StatefulWidget {
  final bool isOnline;
  final bool isLoading;
  final ValueChanged<bool> onStatusChanged;

  const SwipeableOnlineButton({
    super.key,
    required this.isOnline,
    required this.onStatusChanged,
    this.isLoading = false,
  });

  @override
  State<SwipeableOnlineButton> createState() => _SwipeableOnlineButtonState();
}

class _SwipeableOnlineButtonState extends State<SwipeableOnlineButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _dragValue = 0.0;
  double _maxWidth = 0.0;
  static const double _thumbHeight = 52.0;
  static const double _thumbWidth = 64.0;
  static const double _padding = 4.0;

  @override
  void didUpdateWidget(SwipeableOnlineButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isOnline != oldWidget.isOnline || widget.isLoading != oldWidget.isLoading) {
      setState(() {
        _dragValue = 0.0;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDragUpdate(DragUpdateDetails details) {
    if (widget.isLoading) return;
    final double maxDrag = _maxWidth - _thumbWidth - (_padding * 2);
    if (maxDrag <= 0) return;

    setState(() {
      if (!widget.isOnline) {
        // Offline: Drag Right (positive dx) to go Online
        _dragValue = (_dragValue + details.delta.dx).clamp(0.0, maxDrag);
      } else {
        // Online: Drag Left (negative dx) to go Offline
        _dragValue = (_dragValue - details.delta.dx).clamp(0.0, maxDrag);
      }
    });
  }

  void _onDragEnd(DragEndDetails details) {
    if (widget.isLoading) return;
    final double maxDrag = _maxWidth - _thumbWidth - (_padding * 2);
    if (maxDrag <= 0) return;

    if (_dragValue > maxDrag * 0.65) {
      widget.onStatusChanged(!widget.isOnline);
    } else {
      _snapBack();
    }
  }

  void _snapBack() {
    _controller.stop();
    final double start = _dragValue;
    _controller.reset();

    final Animation<double> animation = Tween<double>(begin: start, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
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
    final isOnline = widget.isOnline;
    final isLoading = widget.isLoading;

    return LayoutBuilder(
      builder: (context, constraints) {
        _maxWidth = constraints.maxWidth;
        final double maxDrag = (_maxWidth - _thumbWidth - (_padding * 2)).clamp(0.0, 1000.0);
        final double progress = maxDrag > 0 ? (_dragValue / maxDrag).clamp(0.0, 1.0) : 0.0;

        return Container(
          height: _thumbHeight + (_padding * 2),
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(100),
            gradient: isOnline
                ? const LinearGradient(
                    colors: [Color(0xFF221111), Color(0xFF160E0E)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : const LinearGradient(
                    colors: [Color(0xFF211D14), Color(0xFF141310)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
            border: Border.all(
              color: isOnline
                  ? const Color(0xFFEF4444).withValues(alpha: 0.45)
                  : AppTheme.primaryColor.withValues(alpha: 0.4),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: isOnline
                    ? const Color(0xFFEF4444).withValues(alpha: 0.15)
                    : AppTheme.primaryColor.withValues(alpha: 0.18),
                blurRadius: 18,
                spreadRadius: 1,
                offset: const Offset(0, 4),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.6),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Shimmer / track indicator fill
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.all(_padding),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(100),
                    child: Align(
                      alignment: isOnline ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        width: (_thumbWidth + _dragValue).clamp(0.0, _maxWidth),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: isOnline
                                ? [
                                    const Color(0xFFEF4444).withValues(alpha: 0.05),
                                    const Color(0xFFEF4444).withValues(alpha: 0.25),
                                  ]
                                : [
                                    AppTheme.primaryColor.withValues(alpha: 0.05),
                                    AppTheme.primaryColor.withValues(alpha: 0.25),
                                  ],
                            begin: isOnline ? Alignment.centerRight : Alignment.centerLeft,
                            end: isOnline ? Alignment.centerLeft : Alignment.centerRight,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // Center Action Label with Fade on Drag
              Opacity(
                opacity: (1.0 - (progress * 1.4)).clamp(0.0, 1.0),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!isOnline) ...[
                      const Icon(
                        Icons.power_settings_new_rounded,
                        color: AppTheme.primaryColor,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      isLoading
                          ? "UPDATING STATUS..."
                          : (isOnline ? "SLIDE TO GO OFFLINE" : "SLIDE TO GO ONLINE"),
                      style: GoogleFonts.outfit(
                        color: isOnline ? const Color(0xFFFCA5A5) : AppTheme.primaryLight,
                        fontWeight: FontWeight.w800,
                        fontSize: 13.5,
                        letterSpacing: 1.4,
                      ),
                    ),
                    if (!isOnline) ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.double_arrow_rounded,
                        color: AppTheme.primaryColor.withValues(alpha: 0.6),
                        size: 16,
                      ),
                    ] else ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: const Color(0xFFEF4444).withValues(alpha: 0.6),
                        size: 14,
                      ),
                    ],
                  ],
                ),
              ),

              // Sliding Thumb
              Positioned(
                left: !isOnline ? _padding + _dragValue : null,
                right: isOnline ? _padding + _dragValue : null,
                top: _padding,
                bottom: _padding,
                child: GestureDetector(
                  onHorizontalDragUpdate: _onDragUpdate,
                  onHorizontalDragEnd: _onDragEnd,
                  child: Container(
                    width: _thumbWidth,
                    height: _thumbHeight,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100),
                      gradient: isOnline
                          ? const LinearGradient(
                              colors: [Color(0xFFF87171), Color(0xFFDC2626), Color(0xFF991B1B)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            )
                          : const LinearGradient(
                              colors: [Color(0xFFFDF0CD), Color(0xFFE5B84A), Color(0xFFB8860B)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                      boxShadow: [
                        BoxShadow(
                          color: isOnline
                              ? const Color(0xFFEF4444).withValues(alpha: 0.4)
                              : AppTheme.primaryColor.withValues(alpha: 0.45),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.35),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: isLoading
                          ? SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: isOnline ? Colors.white : Colors.black87,
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  isOnline
                                      ? Icons.power_settings_new_rounded
                                      : Icons.chevron_right_rounded,
                                  color: isOnline ? Colors.white : const Color(0xFF1E1602),
                                  size: isOnline ? 24 : 28,
                                ),
                                if (!isOnline)
                                  const Icon(
                                    Icons.chevron_right_rounded,
                                    color: Color(0xFF1E1602),
                                    size: 20,
                                  ),
                              ],
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
