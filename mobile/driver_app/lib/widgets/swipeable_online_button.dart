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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return LayoutBuilder(
      builder: (context, constraints) {
        _maxWidth = constraints.maxWidth;
        final double maxDrag = (_maxWidth - _thumbWidth - (_padding * 2)).clamp(0.0, 1000.0);
        final double progress = maxDrag > 0 ? (_dragValue / maxDrag).clamp(0.0, 1.0) : 0.0;
        // 0.0 = offline (red), 1.0 = online (green); smoothly fades as user slides
        final double colorT = isOnline ? (1.0 - progress) : progress;

        final Color trackStart = Color.lerp(
          isDark ? const Color(0xFF2B0E0E) : const Color(0xFFFEF2F2),
          isDark ? const Color(0xFF0F1E16) : const Color(0xFFECFDF5),
          colorT,
        )!;
        final Color trackEnd = Color.lerp(
          isDark ? const Color(0xFF1A0808) : const Color(0xFFFEE2E2),
          isDark ? const Color(0xFF08150E) : const Color(0xFFE1F9ED),
          colorT,
        )!;
        final Color borderColor = Color.lerp(
          const Color(0xFFEF4444).withValues(alpha: isDark ? 0.55 : 0.65),
          const Color(0xFF10B981).withValues(alpha: isDark ? 0.55 : 0.65),
          colorT,
        )!;
        final Color glowColor = Color.lerp(
          const Color(0xFFEF4444).withValues(alpha: 0.18),
          const Color(0xFF10B981).withValues(alpha: 0.18),
          colorT,
        )!;
        final Color accentColor = Color.lerp(
          const Color(0xFFEF4444),
          const Color(0xFF10B981),
          colorT,
        )!;
        final Color labelColor = Color.lerp(
          isDark ? const Color(0xFFFCA5A5) : const Color(0xFFB91C1C),
          isDark ? const Color(0xFF6EE7B7) : const Color(0xFF047857),
          colorT,
        )!;
        final Color thumbStart = Color.lerp(
          const Color(0xFFF87171),
          const Color(0xFF34D399),
          colorT,
        )!;
        final Color thumbMid = Color.lerp(
          const Color(0xFFDC2626),
          const Color(0xFF10B981),
          colorT,
        )!;
        final Color thumbEnd = Color.lerp(
          const Color(0xFF991B1B),
          const Color(0xFF047857),
          colorT,
        )!;

        return Container(
          height: _thumbHeight + (_padding * 2),
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(
              colors: [trackStart, trackEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            border: Border.all(
              color: borderColor,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: glowColor,
                blurRadius: 14,
                spreadRadius: 1,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Track reveal fill during drag
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.all(_padding),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Align(
                      alignment: isOnline ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        width: (_thumbWidth + _dragValue).clamp(0.0, _maxWidth),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: isOnline
                                ? [
                                    const Color(0xFFEF4444).withValues(alpha: 0.05),
                                    const Color(0xFFEF4444).withValues(alpha: isDark ? 0.24 : 0.18),
                                  ]
                                : [
                                    const Color(0xFF10B981).withValues(alpha: 0.05),
                                    const Color(0xFF10B981).withValues(alpha: isDark ? 0.24 : 0.18),
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
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: accentColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: accentColor.withValues(alpha: 0.8),
                            blurRadius: 6,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        isLoading
                            ? "UPDATING STATUS..."
                            : (isOnline ? "ONLINE • SLIDE TO GO OFFLINE" : "OFFLINE • SLIDE TO GO ONLINE"),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        style: GoogleFonts.inter(
                          color: labelColor,
                          fontWeight: FontWeight.w800,
                          fontSize: 12.5,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    if (!isOnline) ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.double_arrow_rounded,
                        color: accentColor.withValues(alpha: 0.85),
                        size: 16,
                      ),
                    ] else ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: accentColor.withValues(alpha: 0.85),
                        size: 13,
                      ),
                    ],
                  ],
                ),
              ),

              // Sliding Thumb (Red when offline, Green when online, smoothly fading during slide)
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
                      borderRadius: BorderRadius.circular(12),
                      gradient: LinearGradient(
                        colors: [thumbStart, thumbMid, thumbEnd],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: thumbMid.withValues(alpha: 0.4),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                        BoxShadow(
                          color: isDark ? Colors.black.withValues(alpha: 0.35) : Colors.black.withValues(alpha: 0.1),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Colors.white,
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  isOnline
                                      ? Icons.power_settings_new_rounded
                                      : Icons.chevron_right_rounded,
                                  color: Colors.white,
                                  size: isOnline ? 24 : 28,
                                ),
                                if (!isOnline)
                                  const Icon(
                                    Icons.chevron_right_rounded,
                                    color: Colors.white,
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
